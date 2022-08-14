import { hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import type { InteractionParam } from '../../../../Command.js';
import type { Case } from '../../../../functions/cases/createCase.js';
import { updateCase } from '../../../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../../../functions/logging/upsertCaseLog.js';
import { upsertReportLog } from '../../../../functions/logging/upsertReportLog.js';
import { getReport } from '../../../../functions/reports/getReport.js';
import { updateReport } from '../../../../functions/reports/updateReport.js';
import { resolveMessage } from '../../../../util/resolveMessage.js';

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

	const case_ = await updateCase({
		caseId: originalCase.caseId,
		guildId: interaction.guildId,
		reportRefId: referenceReport.reportId,
	});
	await upsertCaseLog(interaction.guild, interaction.user, case_);

	const report = await updateReport({
		guildId: interaction.guildId,
		reportId,
		referenceId: originalCase.caseId,
	});
	const message = report.messageId
		? await resolveMessage(interaction.channel!.id, report.guildId, report.channelId, report.messageId, locale)
		: undefined;
	await upsertReportLog(interaction.guild, interaction.user, report, message);

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
