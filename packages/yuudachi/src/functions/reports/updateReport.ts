import type { User } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { CreateReport } from './createReport.js';
import { type RawReport, transformReport } from './transformReport.js';
import { kSQL } from '../../tokens.js';

export type PatchReport = Pick<
	Partial<CreateReport>,
	'guildId' | 'reportId' | 'reason' | 'message' | 'refId' | 'attachmentUrl' | 'status'
>;

export async function updateReport(report: PatchReport, moderator?: User) {
	const sql = container.resolve<Sql<any>>(kSQL);

	if (report.status) {
		await sql`
			update reports
			set status = ${report.status}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId!}`;
	}

	if (report.attachmentUrl) {
		await sql`
			update reports
			set attachment_url = ${report.attachmentUrl}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId!}`;
	}

	if (report.reason) {
		await sql`
			update reports
			set reason = ${report.reason}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId!}`;
	}

	if (report.message) {
		await sql`
			update reports
			set message_id = ${report.message.id},
				channel_id = ${report.message.channel.id}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId!}`;
	}

	if (report.refId) {
		await sql`
			update reports
			set ref_id = ${report.refId}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId!}`;
	}

	if (moderator) {
		await sql`
			update reports
			set mod_id = ${moderator.id},
				mod_tag = ${moderator.tag}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId!}`;
	}

	const [updatedCase] = await sql<[RawReport]>`
		select *
		from reports
		where guild_id = ${report.guildId}
			and report_id = ${report.reportId!}`;

	return transformReport(updatedCase);
}
