import { hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import type { InteractionParam } from '../../../../Command.js';
import type { Case } from '../../../../functions/cases/createCase.js';
import { updateCase } from '../../../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../../../functions/logging/upsertCaseLog.js';
import { upsertReportLog } from '../../../../functions/logging/upsertReportLog.js';
import { ReportStatus } from '../../../../functions/reports/createReport.js';
import { getReport } from '../../../../functions/reports/getReport.js';
import { updateReport } from '../../../../functions/reports/updateReport.js';

export async function reportReference(
	interaction: InteractionParam,
	logChannelId: string,
	originalCase: Case,
	reportId: number,
	locale: string,
) {
	const referenceReport = await getReport(interaction.guildId, reportId);

	if (!referenceReport) {
		throw new Error(
			i18next.t('command.mod.common.errors.no_reference_report', {
				report: reportId,
				lng: locale,
			}),
		);
	}

	const [case_, report] = await Promise.all([
		updateCase({
			caseId: originalCase.caseId,
			guildId: interaction.guildId,
			reportRef: referenceReport.reportId,
		}),
		updateReport(
			{
				guildId: interaction.guildId,
				reportId,
				refId: originalCase.caseId,
				status: ReportStatus.Approved,
			},
			interaction.user,
		),
	]);

	await Promise.all([
		upsertCaseLog(interaction.guild, interaction.user, case_),
		upsertReportLog(interaction.guild, report),
	]);

	await interaction.editReply({
		content: i18next.t('command.mod.reference.report', {
			case: hyperlink(
				`\`#${originalCase.caseId}\``,
				messageLink(logChannelId, originalCase.logMessageId!, interaction.guildId),
			),
			ref: hyperlink(
				`\`#${referenceReport.reportId}\``,
				messageLink(logChannelId, referenceReport.logMessageId!, interaction.guildId),
			),
			lng: locale,
		}),
	});
}
