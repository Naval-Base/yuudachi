import { hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { upsertReportLog } from '../../functions/logging/upsertReportLog.js';
import type { ReportStatus } from '../../functions/reports/createReport.js';
import { getReport } from '../../functions/reports/getReport.js';
import { updateReport } from '../../functions/reports/updateReport.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { StatusCommand } from '../../interactions/index.js';

export default class extends Command<typeof StatusCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof StatusCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		const reportLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId),
		);

		if (!reportLogChannel) {
			throw new Error(i18next.t('common.errors.no_report_channel', { lng: locale }));
		}

		const originalReport = await getReport(interaction.guildId, args.report);

		if (!originalReport) {
			throw new Error(i18next.t('command.mod.common.errors.no_report', { report: args.report, lng: locale }));
		}

		const report = await updateReport(
			{
				reportId: originalReport.reportId,
				guildId: interaction.guildId,
				status: args.status as ReportStatus,
			},
			interaction.user,
		);
		await upsertReportLog(interaction.guild, report);

		await interaction.editReply({
			content: i18next.t('command.mod.status.success', {
				report: hyperlink(
					`#${originalReport.reportId}`,
					messageLink(reportLogChannel.id, originalReport.logMessageId!, interaction.guildId),
				),
				status: args.status,
				lng: locale,
			}),
		});
	}
}
