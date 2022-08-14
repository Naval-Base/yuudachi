import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { CreateReport } from './createReport.js';
import { type RawReport, transformReport } from './transformReport.js';
import { kSQL } from '../../tokens.js';

export type PatchCase = Pick<
	Partial<CreateReport>,
	'guildId' | 'reportId' | 'reason' | 'message' | 'referenceId' | 'attachmentUrl'
>;

export async function updateReport(report: PatchCase) {
	const sql = container.resolve<Sql<any>>(kSQL);

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

	if (report.referenceId) {
		await sql`
			update reports
			set ref_id = ${report.referenceId}
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
