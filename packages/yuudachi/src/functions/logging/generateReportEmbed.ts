import type { APIEmbed, Message, User } from "discord.js";
import i18next from "i18next";
import { Color } from "../../Constants.js";
import { type Report, ReportStatus } from "../reports/createReport.js";
import { generateReportLog } from "./generateReportLog.js";

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
		default:
			return Color.DiscordPrimary;
	}
}

export async function generateReportEmbed(
	user: User,
	report: Report,
	locale: string,
	message?: Message | null,
): Promise<APIEmbed> {
	const embed: APIEmbed = {
		title: i18next.t("log.report_log.title", {
			report_id: report.reportId,
			lng: locale,
		}),
		author: {
			name: `${user.tag} (${user.id})`,
			icon_url: user.avatarURL()!,
		},
		color: statusToColor(report.status),
		description: await generateReportLog(report, locale, message),
		timestamp: report.createdAt,
		footer:
			report.status === ReportStatus.Pending
				? {
						text: i18next.t("log.report_log.footer", {
							lng: locale,
						}),
						icon_url: user.client.user!.displayAvatarURL(),
				  }
				: undefined,
	};

	if (report.attachmentUrl) {
		embed.image = {
			url: report.attachmentUrl,
		};
	}

	return embed;
}
