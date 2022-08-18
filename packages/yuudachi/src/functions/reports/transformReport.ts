import type { Snowflake } from 'discord.js';
import type { Report } from './createReport.js';

export interface RawReport {
	guild_id: Snowflake;
	report_id: number;
	type: number;
	status: number;
	message_id?: Snowflake | undefined | null;
	channel_id?: Snowflake;
	target_id: Snowflake;
	target_tag: string;
	author_id: Snowflake;
	author_tag: string;
	mod_id?: Snowflake | undefined | null;
	mod_tag?: string | undefined | null;
	reason: string;
	attachment_url?: string | undefined | null;
	log_message_id?: Snowflake | undefined | null;
	ref_id?: number | undefined | null;
	updated_at?: string | undefined | null;
	created_at: string;
}

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
		logMessageId: report.log_message_id,
		refId: report.ref_id,
		updatedAt: report.updated_at,
		createdAt: report.created_at,
	} as const;
}
