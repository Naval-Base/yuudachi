import { BaseCommandInteraction, ButtonInteraction, MessageActionRow, MessageButton, Permissions } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import type { Redis } from 'ioredis';
import { ms } from '@naval-base/ms';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { generateHistory } from '../../util/generateHistory';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { kRedis } from '../../tokens';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { awaitComponent } from '../../util/awaitComponent';
import type { TimeoutCommand } from '../../interactions/moderation/timeout';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: BaseCommandInteraction<'cached'>,
		args: ArgumentsOf<typeof TimeoutCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (!args.user.member) {
			throw new Error(
				i18next.t('command.mod.timeout.errors.not_member', {
					lng: locale,
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				}),
			);
		}

		if (Date.now() < (args.user.member.communicationDisabledUntilTimestamp ?? 0)) {
			throw new Error(
				i18next.t('command.mod.timeout.errors.already_timed_out', {
					lng: locale,
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				}),
			);
		}

		if (!args.user.member.moderatable || !interaction.guild.me?.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
			throw new Error(
				i18next.t('command.mod.timeout.errors.missing_permissions', {
					lng: locale,
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				}),
			);
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const timeoutKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const timeoutButton = new MessageButton()
			.setCustomId(timeoutKey)
			.setLabel(i18next.t('command.mod.timeout.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.timeout.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t('command.mod.timeout.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [new MessageActionRow().addComponents([cancelButton, timeoutButton])],
		});

		const collectedInteraction = (await awaitComponent(interaction.client, reply, {
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: 'BUTTON',
			time: 15000,
		}).catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		})) as ButtonInteraction<'cached'> | undefined;

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

			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
			await upsertCaseLog(collectedInteraction.guildId, collectedInteraction.user, case_);

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
