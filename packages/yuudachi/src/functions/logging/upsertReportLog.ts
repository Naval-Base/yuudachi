import { Buffer } from "node:buffer";
import type { APIEmbed, Embed, Guild, Message } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import { REPORT_MESSAGE_CONTEXT_LIMIT } from "../../Constants.js";
import { kSQL } from "../../tokens.js";
import { generateUserInfo } from "../../util/generateHistory.js";
import { resolveMemberAndUser } from "../../util/resolveMemberAndUser.js";
import { resolveMessage } from "../../util/resolveMessage.js";
import { type Report, ReportType } from "../reports/createReport.js";
import { checkReportForum } from "../settings/checkLogChannel.js";
import type { ReportStatusTagTuple, ReportTypeTagTuple } from "../settings/getGuildSetting.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { formatMessageToEmbed } from "./formatMessageToEmbed.js";
import { formatMessagesToAttachment } from "./formatMessagesToAttachment.js";
import { generateReportEmbed } from "./generateReportEmbed.js";

export async function upsertReportLog(guild: Guild, report: Report, message?: Message) {
	const sql = container.resolve<Sql<{}>>(kSQL);
	const reportForum = checkReportForum(guild, await getGuildSetting(guild.id, SettingsKeys.ReportChannelId));
	const reportStatusTags = await getGuildSetting<ReportStatusTagTuple>(guild.id, SettingsKeys.ReportStatusTags);
	const reportTypeTags = await getGuildSetting<ReportTypeTagTuple>(guild.id, SettingsKeys.ReportTypeTags);

	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	let localMessage = message;

	try {
		if (!localMessage && report.messageId) {
			localMessage = await resolveMessage(reportForum!.id, report.guildId, report.channelId!, report.messageId, locale);
		}
	} catch {}

	const author = await guild.client.users.fetch(report.authorId);

	const embeds: (APIEmbed | Embed)[] = [await generateReportEmbed(author, report, locale, localMessage)];
	if (localMessage?.inGuild()) {
		embeds.push(formatMessageToEmbed(localMessage, locale));
	}

	if (report.type === ReportType.User) {
		const target = await resolveMemberAndUser(guild, report.targetId);

		embeds.push(generateUserInfo(target, locale));
	}

	const statusTag = reportStatusTags[report.status];
	const typeTag = reportTypeTags[report.type];

	const reportPost = await reportForum!.threads.fetch(report.logPostId ?? "1").catch(() => null);
	const messageContext = localMessage?.inGuild()
		? await localMessage.channel.messages
				.fetch({ around: localMessage.id, limit: REPORT_MESSAGE_CONTEXT_LIMIT })
				.catch(() => null)
		: null;

	if (!reportPost) {
		const reportPost = await reportForum!.threads.create({
			name: i18next.t("command.utility.report.common.post.name", {
				report_id: report.reportId,
				user: `${report.targetTag} (${report.targetId})`,
				lng: locale,
			}),
			message: {
				embeds,
				files:
					messageContext && localMessage
						? [
								{
									name: "messagecontext.ansi",
									attachment: Buffer.from(
										formatMessagesToAttachment(
											messageContext,
											locale,
											[localMessage.id],
											messageContext
												.filter((message: Message) => message.author.id === report.targetId)
												.map((message) => message.id),
										),
									),
								},
						  ]
						: undefined,
			},
			reason: i18next.t("command.utility.report.common.post.reason", {
				user: `${report.authorTag} (${report.authorId})`,
				lng: locale,
			}),
			appliedTags: [typeTag, statusTag],
		});

		await sql`
			update reports
				set log_post_id = ${reportPost.id}
				where guild_id = ${report.guildId}
					and report_id = ${report.reportId}
		`;

		return reportPost;
	}

	if (reportPost.archived) {
		await reportPost.setArchived(false);
	}

	const starter = await reportPost.messages.fetch(reportPost.id);
	await starter?.edit({ embeds });

	if ([statusTag, typeTag].some((required) => !reportPost.appliedTags.includes(required))) {
		// @ts-expect-error upstream does not allow ids, but sends them as if they were ids
		await reportPost.setAppliedTags([typeTag, statusTag]);
	}

	return reportPost;
}
