import { ms } from '@naval-base/ms';
import { ButtonStyle, ComponentType, PermissionFlagsBits } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { CaseAction, createCase } from '../../functions/cases/createCase.js';
import { generateCasePayload } from '../../functions/logging/generateCasePayload.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { TimeoutCommand } from '../../interactions/moderation/timeout.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { createButton } from '../../util/button.js';
import { generateHistory } from '../../util/generateHistory.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

@injectable()
export default class extends Command<typeof TimeoutCommand> {
	public constructor(@inject(kRedis) public readonly redis: Redis) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof TimeoutCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const modLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (!args.user.member) {
			throw new Error(
				i18next.t('command.common.errors.target_not_found', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (Date.now() < (args.user.member.communicationDisabledUntilTimestamp ?? 0)) {
			throw new Error(
				i18next.t('command.mod.timeout.errors.already_timed_out', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (
			!args.user.member.moderatable ||
			!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)
		) {
			throw new Error(
				i18next.t('command.mod.timeout.errors.missing_permissions', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const timeoutKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const timeoutButton = createButton({
			customId: timeoutKey,
			label: i18next.t('command.mod.timeout.buttons.execute', { lng: locale }),
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			customId: cancelKey,
			label: i18next.t('command.common.buttons.cancel', { lng: locale }),
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t('command.mod.timeout.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [createMessageActionRow([cancelButton, timeoutButton])],
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
					});
				} catch (e) {
					const error = e as Error;
					logger.error(error, error.message);
				}
				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.timeout.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === timeoutKey) {
			await collectedInteraction.deferUpdate();

			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:timeout`, 15, '');
			const case_ = await createCase(
				collectedInteraction.guild,
				generateCasePayload({
					guildId: collectedInteraction.guildId,
					user: collectedInteraction.user,
					args: {
						...args,
					},
					duration: ms(args.duration),
					action: CaseAction.Timeout,
				}),
			);
			await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.timeout.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
