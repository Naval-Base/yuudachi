import { kSQL, ellipsis, container } from "@yuudachi/framework";
import {
	type Message,
	type Snowflake,
	codeBlock,
	hyperlink,
	messageLink,
	userMention,
	channelMention,
	time,
	TimestampStyles,
} from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { REPORT_REASON_MAX_LENGTH } from "../../Constants.js";
import { caseActionLabel } from "../../util/actionKeys.js";
import type { CaseAction } from "../cases/createCase.js";
import type { Report } from "../reports/createReport.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";

export async function generateReportLog(report: Report, locale: string, message?: Message | null): Promise<string> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const parts = [
		i18next.t("log.report_log.target", {
			target: `${userMention(report.targetId)} - \`${report.targetTag}\` (${report.targetId})`,
			lng: locale,
		}),
		i18next.t("log.report_log.reason", {
			reason: codeBlock(ellipsis(report.reason.trim(), REPORT_REASON_MAX_LENGTH * 2)),
			lng: locale,
		}),
	];

	if (message || report.messageId) {
		parts.push(
			i18next.t("log.report_log.message", {
				message_link: message
					? hyperlink(i18next.t("log.report_log.message_sub", { lng: locale }), message.url)
					: i18next.t("log.report_log.message_fallback", { lng: locale }),
				channel: channelMention(report.channelId!),
				lng: locale,
			}),
		);
	}

	if (report.refId) {
		const [reference] = await sql<[{ action: CaseAction; log_message_id: Snowflake | null }?]>`
			select log_message_id, action
			from cases
			where guild_id = ${report.guildId}
				and case_id = ${report.refId}
		`;

		const modLogChannelId = await getGuildSetting(report.guildId, SettingsKeys.ModLogChannelId);

		if (modLogChannelId && Reflect.has(reference ?? {}, "log_message_id") && Reflect.has(reference ?? {}, "action")) {
			parts.push(
				i18next.t("log.report_log.case_reference", {
					ref: hyperlink(`#${report.refId}`, messageLink(modLogChannelId, reference!.log_message_id!, report.guildId)),
					action: caseActionLabel(reference!.action, locale),
					lng: locale,
				}),
			);
		}
	}

	parts.push(
		i18next.t("log.report_log.status", {
			status: report.status,
			lng: locale,
		}),
	);

	if (report.modId && report.modTag) {
		parts.push(
			"",
			i18next.t("log.report_log.moderator", {
				mod: `\`${report.modTag}\` (${report.modId})`,
				lng: locale,
			}),
			i18next.t("log.report_log.updated_at", {
				updated_at: time(new Date(report.updatedAt ?? report.createdAt), TimestampStyles.ShortDateTime),
				lng: locale,
			}),
		);
	}

	return parts.join("\n");
}
