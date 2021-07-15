import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { KickCommand } from '../../interactions';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { generateHistory } from '../../util/generateHistory';
import { createCase, CaseAction } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { checkModLogChannel } from '../../functions/settings/checkModLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof KickCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkModLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (!args.user.member?.kickable) {
			throw new Error(
				i18next.t('command.mod.kick.errors.missing_permissions', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const kickKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user);

		const kickButton = new MessageButton()
			.setCustomId(kickKey)
			.setLabel(i18next.t('command.mod.kick.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.kick.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t('command.mod.kick.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			// @ts-expect-error
			embeds: [embed],
			components: [new MessageActionRow().addComponents([cancelButton, kickButton])],
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
				content: i18next.t('command.mod.kick.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === kickKey) {
			await collectedInteraction.deferUpdate();

			const case_ = await createCase(
				collectedInteraction.guild!,
				generateCasePayload({
					guildId: collectedInteraction.guildId!,
					user: collectedInteraction.user,
					args,
					action: CaseAction.Kick,
				}),
			);
			await upsertCaseLog(collectedInteraction.guild!, collectedInteraction.user, logChannel, case_);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.kick.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
