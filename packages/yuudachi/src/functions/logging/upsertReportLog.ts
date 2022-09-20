import type { APIEmbed, Embed, Guild, Message } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import { kSQL } from "../../tokens.js";
import { generateUserInfo } from "../../util/generateHistory.js";
import { resolveMemberAndUser } from "../../util/resolveMemberAndUser.js";
import { resolveMessage } from "../../util/resolveMessage.js";
import { type Report, ReportType } from "../reports/createReport.js";
import { checkReportForum } from "../settings/checkLogChannel.js";
import type { ReportStatusLabelTuple, ReportTypeLabelTuple } from "../settings/getGuildSetting.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { formatMessageToEmbed } from "./formatMessageToEmbed.js";
import { generateReportEmbed } from "./generateReportEmbed.js";

export async function upsertReportLog(guild: Guild, report: Report, message?: Message) {
	const sql = container.resolve<Sql<{}>>(kSQL);
	const reportForum = checkReportForum(guild, await getGuildSetting(guild.id, SettingsKeys.ReportChannelId));
	const reportStatusLabels = await getGuildSetting<ReportStatusLabelTuple>(guild.id, SettingsKeys.ReportStatusLabels);
	const reportTypeLabels = await getGuildSetting<ReportTypeLabelTuple>(guild.id, SettingsKeys.ReportTypeLabels);

	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	let localMessage = message;

	try {
		if (!localMessage && report.messageId) {
			localMessage = await resolveMessage(reportForum!.id, report.guildId, report.channelId!, report.messageId, locale);
		}
	} catch {}

	const author = await guild.client.users.fetch(report.authorId);

	const embeds: (APIEmbed | Embed)[] = [await generateReportEmbed(author, report, locale, localMessage)];
	if (localMessage) {
		embeds.push(formatMessageToEmbed(localMessage as Message<true>, locale));
	}

	if (report.type === ReportType.User) {
		const target = await resolveMemberAndUser(guild, report.targetId);

		embeds.push(generateUserInfo(target, locale));
	}

	const statusLabel = reportStatusLabels[report.status];
	const typeLabel = reportTypeLabels[report.type];

	const reportPost = await reportForum!.threads.fetch(report.logMessageId ?? "1").catch(() => null);

	if (!reportPost) {
		const reportPost = await reportForum!.threads.create({
			name: i18next.t("command.utility.report.common.post.name", {
				report_id: report.reportId,
				user: `${report.targetTag} (${report.targetId})`,
				lng: locale,
			}),
			message: {
				embeds,
			},
			reason: i18next.t("command.utility.report.common.post.reason", {
				user: `${report.authorTag} (${report.authorId})`,
				lng: locale,
			}),
			appliedTags: [typeLabel, statusLabel],
		});

		await sql`
			update reports
				set log_message_id = ${reportPost.id}
				where guild_id = ${report.guildId}
					and report_id = ${report.reportId}
		`;

		return reportPost;
	}

	const starter = await reportPost.messages.fetch(reportPost.id);
	await starter?.edit({ embeds });

	if ([statusLabel, typeLabel].some((required) => !reportPost.appliedTags.includes(required))) {
		// @ts-expect-error upstream does not allow ids, but sends them as if they were ids
		await reportPost.setAppliedTags([typeLabel, statusLabel]);
	}

	return reportPost;
}
