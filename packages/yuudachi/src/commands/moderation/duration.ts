import { ms } from '@naval-base/ms';
import { type CommandInteraction, hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import type { Command } from '../../Command.js';
import { getCase } from '../../functions/cases/getCase.js';
import { updateCase } from '../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { DurationCommand } from '../../interactions/index.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof DurationCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		const modLogChannel = await checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		const originalCase = await getCase(interaction.guildId, args.case);

		if (!originalCase) {
			throw new Error(i18next.t('command.mod.common.errors.no_case', { case: args.case, lng: locale }));
		}

		const parsedDuration = ms(args.duration);

		if (parsedDuration < 300000 || isNaN(parsedDuration)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const case_ = await updateCase({
			caseId: originalCase.caseId,
			guildId: interaction.guildId,
			actionExpiration: new Date(Date.now() + parsedDuration),
		});
		await upsertCaseLog(interaction.guild, interaction.user, case_);

		await interaction.editReply({
			content: i18next.t('command.mod.duration.success', {
				case: hyperlink(
					`#${originalCase.caseId}`,
					messageLink(interaction.guildId, modLogChannel.id, originalCase.logMessageId!),
				),
				lng: locale,
			}),
		});
	}
}
