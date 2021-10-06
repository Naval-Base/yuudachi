import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { WarnCommand } from '../../interactions';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { generateHistory } from '../../util/generateHistory';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof WarnCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const warnKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const warnButton = new MessageButton()
			.setCustomId(warnKey)
			.setLabel(i18next.t('command.mod.warn.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.warn.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t('command.mod.warn.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			// @ts-expect-error
			embeds: [embed],
			components: [new MessageActionRow().addComponents([cancelButton, warnButton])],
		});

		const collectedInteraction = await interaction.channel
			?.awaitMessageComponent({
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
				} catch (e) {
					const error = e as Error;
					logger.error(error, error.message);
				}
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.warn.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === warnKey) {
			await collectedInteraction.deferUpdate();

			const case_ = await createCase(
				collectedInteraction.guild!,
				generateCasePayload({
					guildId: collectedInteraction.guildId!,
					user: collectedInteraction.user,
					args,
					action: CaseAction.Warn,
				}),
			);
			await upsertCaseLog(collectedInteraction.guildId!, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.warn.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
