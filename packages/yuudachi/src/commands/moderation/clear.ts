import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { type APIEmbed, ButtonStyle, ComponentType, type Webhook, type Message } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import { Color, DATE_FORMAT_LOGFILE } from '../../Constants.js';
import { formatMessageToEmbed } from '../../functions/logging/formatMessageToEmbed.js';
import { formatMessagesToAttachment } from '../../functions/logging/formatMessagesToAttachment.js';
import { fetchMessages, orderMessages, pruneMessages } from '../../functions/pruning/pruneMessages.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ClearCommand, ClearContextCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { kWebhooks } from '../../tokens.js';
import { createButton } from '../../util/button.js';
import { addFields, truncateEmbed } from '../../util/embed.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';
import { parseMessageLink, resolveMessage, validateSnowflake } from '../../util/resolveMessage.js';

async function resolveSnowflakeOrLink(
	interaction: InteractionParam,
	arg: string,
	locale: string,
	argumentName: string,
) {
	if (validateSnowflake(arg)) {
		return resolveMessage(interaction.channelId, interaction.guildId, interaction.channelId, arg, locale);
	}

	const parsedLink = parseMessageLink(arg);
	if (!parsedLink) {
		throw new Error(
			i18next.t('command.common.errors.not_message_link', {
				val: arg,
				arg: argumentName,
				lng: locale,
			}),
		);
	}

	const { guildId, channelId, messageId } = parsedLink;
	return resolveMessage(interaction.channelId, guildId!, channelId!, messageId!, locale);
}

@injectable()
export default class extends Command<typeof ClearCommand | typeof ClearContextCommand> {
	public constructor(@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>) {
		super(['clear', 'Clear messages to']);
	}

	private async handle(
		interaction: InteractionParam | InteractionParam<CommandMethod.MessageContext>,
		locale: LocaleParam,
		firstMessage: Message,
		lastMessage?: Message | undefined,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });

		if (lastMessage && firstMessage.channelId !== lastMessage.channelId) {
			throw new Error(
				i18next.t('command.mod.clear.errors.other_channel', {
					lng: locale,
				}),
			);
		}

		const { oldest } = orderMessages(firstMessage, lastMessage);
		const messages = await fetchMessages(interaction.channel!, firstMessage, lastMessage);

		if (messages.size < 1) {
			throw new Error(
				i18next.t('command.mod.clear.errors.no_results', {
					lng: locale,
				}),
			);
		}

		const uniqueAuthors = new Set(messages.map((m) => m.author.id));
		const latest = messages.first()!;
		const earliest = messages.last()!;
		const delta = latest.createdTimestamp - earliest.createdTimestamp;

		const clearKey = nanoid();
		const cancelKey = nanoid();

		const clearButton = createButton({
			customId: clearKey,
			label: i18next.t('command.mod.clear.buttons.execute', { count: messages.size, lng: locale }),
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			customId: cancelKey,
			label: i18next.t('command.common.buttons.cancel', { lng: locale }),
			style: ButtonStyle.Secondary,
		});

		const confirmParts = [
			i18next.t('command.mod.clear.pending', {
				count: messages.size,
				author_count: uniqueAuthors.size,
				time: ms(delta, true),
				lng: locale,
			}),
		];

		const embeds: APIEmbed[] = [];

		if (!messages.has(oldest.id)) {
			embeds.push(formatMessageToEmbed(earliest as Message<true>, locale));
			confirmParts.push(
				i18next.t('command.mod.clear.message_too_old', {
					embeds,
					lng: locale,
				}),
				'',
			);
		}

		await interaction.editReply({
			content: confirmParts.join('\n'),
			components: [createMessageActionRow([cancelButton, clearButton])],
			embeds,
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t('command.common.errors.timed_out', { lng: locale }),
						components: [],
						embeds: [],
					});
				} catch (e) {
					const error = e as Error;
					logger.error(error, error.message);
				}
				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.clear.cancel', {
					lng: locale,
				}),
				components: [],
				embeds: [],
			});
		} else if (collectedInteraction?.customId === clearKey) {
			logger.info(`Pruning messages`, {
				amount: messages.size,
				timespan: ms(delta, true),
				unique_authors: uniqueAuthors.size,
			});

			await collectedInteraction.deferUpdate();
			const prunedMessages = await pruneMessages(interaction.channel!, messages);

			const prunedUniqueAuthors = new Set(messages.map((m) => m.author.id));
			const prunedLatest = messages.first()!;
			const prunedEarliest = messages.last()!;
			const prunedDelta = prunedLatest.createdTimestamp - prunedEarliest.createdTimestamp;

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.clear.success', {
					count: prunedMessages.size,
					author_count: prunedUniqueAuthors.size,
					time: ms(prunedDelta, true),
					lng: locale,
				}),
				components: [],
				embeds: [],
			});

			try {
				const guildLogWebhookId = await getGuildSetting(firstMessage.guildId!, SettingsKeys.GuildLogWebhookId);

				if (!guildLogWebhookId) {
					return;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					return;
				}

				const ignoreChannels = await getGuildSetting(firstMessage.guildId!, SettingsKeys.LogIgnoreChannels);

				if (
					!firstMessage.inGuild() ||
					ignoreChannels.includes(firstMessage.channelId) ||
					(firstMessage.channel.parentId && ignoreChannels.includes(firstMessage.channel.parentId)) ||
					(firstMessage.channel.parent?.parentId && ignoreChannels.includes(firstMessage.channel.parent.parentId))
				) {
					return;
				}

				const descriptionParts = [
					i18next.t('log.guild_log.messages_cleared.messages', {
						count: prunedMessages.size,
						lng: locale,
					}),
					i18next.t('log.guild_log.messages_cleared.authors', {
						count: prunedUniqueAuthors.size,
						lng: locale,
					}),
					i18next.t('log.guild_log.messages_cleared.time', {
						time: ms(prunedDelta, true),
						lng: locale,
					}),
				];

				const embed = addFields({
					author: {
						name: `${i18next.t('common.moderator', {
							lng: locale,
						})}: ${interaction.user.tag} (${interaction.user.id})`,
						icon_url: interaction.member.displayAvatarURL(),
					},
					description: descriptionParts.join('\n'),
					title: i18next.t('log.guild_log.messages_cleared.title'),
					timestamp: new Date().toISOString(),
					color: Color.DiscordWarning,
				});

				const logDate = dayjs().format(DATE_FORMAT_LOGFILE);
				await webhook.send({
					embeds: [truncateEmbed(embed)],
					files: [
						{
							name: `${logDate}-clear-logs.txt`,
							attachment: Buffer.from(formatMessagesToAttachment(prunedMessages, locale), 'utf-8'),
						},
					],
					username: interaction.client.user!.username,
					avatarURL: interaction.client.user!.displayAvatarURL(),
				});
			} catch (err) {
				const error = err as Error;
				logger.error(error.message, error);
			}
		}
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ClearCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const lastMessage = await resolveSnowflakeOrLink(interaction, args.last_message, locale, 'last_message');
		const firstMessage = args.first_message
			? await resolveSnowflakeOrLink(interaction, args.first_message, locale, 'first_message')
			: undefined;

		await this.handle(interaction, locale, lastMessage, firstMessage);
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof ClearContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await this.handle(interaction, locale, args.message, undefined);
	}
}
