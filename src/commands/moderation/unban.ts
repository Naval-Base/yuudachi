import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import type { Redis } from 'ioredis';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { UnbanCommand } from '../../interactions';
import { generateHistory } from '../../util/generateHistory';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { deleteCase } from '../../functions/cases/deleteCase';
import { kRedis } from '../../tokens';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { awaitComponent } from '../../util/awaitComponent';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof UnbanCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		try {
			await interaction.guild!.bans.fetch(args.user.user.id);
		} catch {
			throw new Error(
				i18next.t('command.mod.unban.errors.no_ban', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const unbanKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const unbanButton = new MessageButton()
			.setCustomId(unbanKey)
			.setLabel(i18next.t('command.mod.unban.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.unban.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t('command.mod.unban.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [new MessageActionRow().addComponents([cancelButton, unbanButton])],
		});

		const collectedInteraction = await awaitComponent(interaction.client, reply, {
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
		});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.unban.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === unbanKey) {
			await collectedInteraction.deferUpdate();

			await this.redis.setex(`guild:${collectedInteraction.guildId!}:user:${args.user.user.id}:unban`, 15, '');
			const case_ = await deleteCase({
				guild: collectedInteraction.guild!,
				user: collectedInteraction.user,
				target: args.user.user,
				reason: args.reason,
				manual: true,
			});
			await upsertCaseLog(collectedInteraction.guildId!, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.unban.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
