import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
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
import { checkModLogChannel } from '../../functions/settings/checkModLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public redis: Redis) {}

	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof UnbanCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkModLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
			locale,
		);

		try {
			await interaction.guild?.bans.fetch(args.user.user.id);
		} catch {
			throw new Error(
				i18next.t('command.mod.unban.errors.no_ban', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const unbanKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user);

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
			// @ts-expect-error
			embeds: [embed],
			components: [new MessageActionRow().addComponents([cancelButton, unbanButton])],
		});

		const collectedInteraction = await interaction.channel
			?.awaitMessageComponent<ButtonInteraction>({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: 'BUTTON',
				time: 15000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t('common.errors.timed_out', { lng: locale }),
						components: [],
					});
				} catch {}
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

			await this.redis.setex(`guild:${collectedInteraction.guildId!}:user:${args.user.user.id}:unban`, 30, '');
			const case_ = await deleteCase({
				guild: collectedInteraction.guild!,
				user: collectedInteraction.user,
				target: args.user.user,
				reason: args.reason,
				manual: true,
			});
			await upsertCaseLog(collectedInteraction.guild!, collectedInteraction.user, logChannel, case_);

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
