import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { ReferenceCommand } from '../../interactions';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { updateCase } from '../../functions/cases/updateCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkModLogChannel } from '../../functions/settings/checkModLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof ReferenceCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkModLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
			locale,
		);

		const case_ = await updateCase({
			caseId: args.case,
			guildId: interaction.guildId!,
			referenceId: args.reference,
		});
		await upsertCaseLog(interaction.guild!, interaction.user, logChannel, case_);

		await interaction.editReply({
			content: i18next.t('command.mod.reference.success', { case: args.case, ref: args.reference, lng: locale }),
		});
	}
}
