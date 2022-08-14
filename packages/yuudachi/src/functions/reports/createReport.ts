import type { Message, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { type RawReport, transformReport } from './transformReport.js';
import { kSQL } from '../../tokens.js';

export interface Report {
	guildId: Snowflake;
	reportId: number;
	type: ReportType;
	status: ReportStatus;
	messageId?: Snowflake | undefined | null;
	channelId: Snowflake;
	targetId: Snowflake;
	targetTag: string;
	authorId: Snowflake;
	authorTag: string;
	reason: string;
	attachmentUrl?: string | undefined | null;
	logMessageId?: Snowflake | undefined | null;
	referenceId?: number | undefined | null;
	createdAt: string;
}

export interface CreateReport {
	guildId: Snowflake;
	reportId?: number;
	type?: ReportType;
	status?: ReportStatus;
	message?: Message<boolean>;
	targetId: Snowflake;
	targetTag: string;
	authorId: Snowflake;
	authorTag: string;
	reason: string;
	attachmentUrl?: string | undefined | null;
	logMessageId?: Snowflake | undefined | null;
	referenceId?: number | undefined | null;
}

export enum ReportType {
	Message,
	User,
}

export enum ReportStatus {
	Pending,
	Approved,
	Rejected,
	False,
}

export async function createReport(report: CreateReport): Promise<Report> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [rawReport] = await sql<[RawReport]>`
		insert into reports (
			report_id,
			guild_id,
			type,
			status,
			message_id,
			channel_id,
			target_id,
			target_tag,
			author_id,
			author_tag,
			reason,
			attachment_url,
			log_message_id,
			ref_id
		) values (
			next_report(${report.guildId}),
			${report.guildId},
			${report.type ?? report.message ? ReportType.Message : ReportType.User},
			${report.status ?? ReportStatus.Pending},
			${report.message?.id ?? null},
			${report.message?.channelId ?? null},
			${report.targetId},
			${report.targetTag},
			${report.authorId},
			${report.authorTag},
			${report.reason},
			${report.attachmentUrl ?? null},
			${report.logMessageId ?? null},
			${report.referenceId ?? null}
		) returning *;
	`;

	return transformReport(rawReport);
}
