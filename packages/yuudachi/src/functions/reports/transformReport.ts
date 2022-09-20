import type { Snowflake } from "discord.js";
import type { Report } from "./createReport.js";

export type RawReport = {
	attachment_url: string | null;
	author_id: Snowflake;
	author_tag: string;
	channel_id: Snowflake;
	created_at: string;
	guild_id: Snowflake;
	log_post_id: Snowflake | null;
	message_id: Snowflake | null;
	mod_id: Snowflake | null;
	mod_tag: string | null;
	reason: string;
	ref_id: number | null;
	report_id: number;
	status: number;
	target_id: Snowflake;
	target_tag: string;
	type: number;
	updated_at: string | null;
};

export function transformReport(report: RawReport): Report {
	return {
		guildId: report.guild_id,
		reportId: report.report_id,
		type: report.type,
		status: report.status,
		messageId: report.message_id,
		channelId: report.channel_id,
		targetId: report.target_id,
		targetTag: report.target_tag,
		authorId: report.author_id,
		authorTag: report.author_tag,
		modId: report.mod_id,
		modTag: report.mod_tag,
		reason: report.reason,
		attachmentUrl: report.attachment_url,
		logPostId: report.log_post_id,
		refId: report.ref_id,
		updatedAt: report.updated_at,
		createdAt: report.created_at,
	} as const;
}
