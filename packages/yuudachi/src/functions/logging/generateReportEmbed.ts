import type { APIEmbed, Message, User } from 'discord.js';
import i18next from 'i18next';
import { generateReportLog } from './generateReportLog.js';
import { Color } from '../../Constants.js';
import { type Report, ReportStatus } from '../reports/createReport.js';

function statusToColor(status: ReportStatus): Color {
	switch (status) {
		case ReportStatus.Pending:
			return Color.DiscordPrimary;
		case ReportStatus.Approved:
			return Color.DiscordSuccess;
		case ReportStatus.Rejected:
			return Color.DiscordWarning;
		case ReportStatus.Spam:
			return Color.DiscordDanger;
	}
}

export async function generateReportEmbed(
	user: User,
	report: Report,
	locale: string,
	message?: Message | null,
): Promise<APIEmbed> {
	const embed: APIEmbed = {
		author: {
			name: i18next.t('log.report_log.author', {
				author: `${user.tag} (${user.id})`,
				lng: locale,
			}),
			icon_url: user.avatarURL()!,
		},
		color: statusToColor(report.status),
		description: await generateReportLog(report, locale, message),
		timestamp: report.createdAt,
		footer: {
			text: i18next.t('log.report_log.footer', {
				report_id: report.reportId,
				type: report.type,
				lng: locale,
			}),
		},
	};

	if (report.attachmentUrl) {
		embed.image = {
			url: report.attachmentUrl,
		};
	}

	return embed;
}
