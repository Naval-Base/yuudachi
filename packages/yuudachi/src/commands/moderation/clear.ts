import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { type APIEmbed, ButtonStyle, ComponentType, type Webhook } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import { formatMessagesToAttachment } from '../../functions/logging/formatMessagesToAttachment.js';
import { fetchMessages, orderMessages, pruneMessages } from '../../functions/pruning/pruneMessages.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ClearCommand } from '../../interactions/moderation/clear.js';
import { logger } from '../../logger.js';
import { kWebhooks } from '../../tokens.js';
import { createButton } from '../../util/button.js';
import { addFields, truncateEmbed } from '../../util/embed.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

@injectable()
export default class extends Command<typeof ClearCommand> {
	public constructor(@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ClearCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });

		if (!/^\d{17,20}$/.test(args.last_message)) {
			throw new Error(
				i18next.t('command.common.errors.not_message_id', {
					val: args.last_message,
					arg: 'from',
					lng: locale,
				}),
			);
		}

		if (args.first_message && !/^\d{17,20}$/.test(args.first_message)) {
			throw new Error(
				i18next.t('command.common.errors.not_message_id', {
					val: args.first_message,
					arg: 'to',
					lng: locale,
				}),
			);
		}

		const firstMessage = await interaction.channel!.messages.fetch(args.last_message).catch(() => {
			throw new Error(
				i18next.t('command.mod.clear.errors.no_message', {
					message_id: args.last_message,
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: interaction.channel!.toString(),
					lng: locale,
				}),
			);
		});
		const lastMessage = args.first_message
			? await interaction.channel!.messages.fetch(args.first_message).catch(() => {
					throw new Error(
						i18next.t('command.mod.clear.errors.no_message', {
							message_id: args.first_message,
							// eslint-disable-next-line @typescript-eslint/no-base-to-string
							channel: interaction.channel!.toString(),
							lng: locale,
						}),
					);
			  })
			: undefined;

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
			embeds.push({
				author: {
					name: `${earliest.author.tag} (${earliest.author.id})`,
					url: earliest.url,
					icon_url: earliest.author.displayAvatarURL(),
				},
				description: earliest.content.length
					? earliest.content
					: i18next.t('common.errors.no_content', {
							lng: locale,
					  }),
				timestamp: earliest.createdAt.toISOString(),
				color: 3092790,
			});

			confirmParts.push(
				i18next.t('command.mod.clear.message_too_old', {
					lng: locale,
					embeds,
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
				const ignoreChannels = await getGuildSetting(firstMessage.guildId!, SettingsKeys.LogIgnoreChannels);

				if (
					!firstMessage.inGuild() ||
					ignoreChannels.includes(firstMessage.channelId) ||
					(firstMessage.channel.parentId && ignoreChannels.includes(firstMessage.channel.parentId)) ||
					(firstMessage.channel.parent?.parentId && ignoreChannels.includes(firstMessage.channel.parent.parentId))
				) {
					return;
				}

				if (!guildLogWebhookId) {
					return;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
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
					color: 6094749,
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
}
