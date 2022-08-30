import type { Message, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { CamelCasedProperties } from 'type-fest';
import { type RawReport, transformReport } from './transformReport.js';
import { kSQL } from '../../tokens.js';
import type { PartialAndUndefinedOnNull } from '../../util/types.js';

export type Report = PartialAndUndefinedOnNull<CamelCasedProperties<RawReport>> & {
	type: ReportType;
	status: ReportStatus;
};

export type CreateReport = Omit<Report, 'status' | 'channelId' | 'reportId' | 'createdAt'> & {
	reportId?: number | undefined | null;
	status?: ReportStatus | undefined | null;
	message?: Message | undefined | null;
	channelId?: Snowflake | undefined | null;
	createdAt?: Date | undefined | null;
};

export enum ReportType {
	Message,
	User,
}

export enum ReportStatus {
	Pending,
	Approved,
	Rejected,
	Spam,
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
			${report.type},
			${report.status ?? ReportStatus.Pending},
			${report.message?.id ?? report.messageId ?? null},
			${report.message?.channelId ?? report.channelId ?? null},
			${report.targetId},
			${report.targetTag},
			${report.authorId},
			${report.authorTag},
			${report.reason},
			${report.attachmentUrl ?? null},
			${report.logMessageId ?? null},
			${report.refId ?? null}
		) returning *;
	`;

	return transformReport(rawReport);
}
