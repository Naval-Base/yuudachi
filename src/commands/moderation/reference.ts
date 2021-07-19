import { CommandInteraction, Formatters } from 'discord.js';
import i18next from 'i18next';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { ReferenceCommand } from '../../interactions';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { updateCase } from '../../functions/cases/updateCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { getCase } from '../../functions/cases/getCase';
import { generateMessageLink } from '../../util/generateMessageLink';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof ReferenceCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		const originalCase = await getCase(interaction.guildId!, args.case);
		if (!originalCase) {
			throw new Error(i18next.t('command.mod.common.errors.no_case', { case: args.case, lng: locale }));
		}

		const referenceCase = await getCase(interaction.guildId!, args.reference);
		if (!referenceCase) {
			throw new Error(i18next.t('command.mod.common.errors.no_ref_case', { case: args.reference, lng: locale }));
		}

		const case_ = await updateCase({
			caseId: originalCase.caseId,
			guildId: interaction.guildId!,
			referenceId: referenceCase.caseId,
		});
		await upsertCaseLog(interaction.guild!, interaction.user, logChannel, case_);

		await interaction.editReply({
			content: i18next.t('command.mod.reference.success', {
				case: Formatters.hyperlink(
					`#${originalCase.caseId}`,
					generateMessageLink(interaction.guildId!, logChannel.id, originalCase.logMessageId!),
				),
				ref: Formatters.hyperlink(
					`#${referenceCase.caseId}`,
					generateMessageLink(interaction.guildId!, logChannel.id, referenceCase.logMessageId!),
				),
				lng: locale,
			}),
		});
	}
}
