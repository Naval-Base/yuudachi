import { kSQL, container } from "@yuudachi/framework";
import type { Sql } from "postgres";
import type { Report } from "./createReport.js";
import { ReportStatus } from "./createReport.js";
import { type RawReport, transformReport } from "./transformReport.js";

export async function getReport(guildId: string, reportId: number) {
	const sql = container.get<Sql<any>>(kSQL);

	const [rawReport] = await sql<[RawReport?]>`
		select *
		from reports
		where guild_id = ${guildId}
			and report_id = ${reportId};
	`;

	if (!rawReport) {
		return null;
	}

	return transformReport(rawReport);
}

export async function getPendingReportByTarget(guildId: string, targetId: string): Promise<Report | null> {
	const sql = container.get<Sql<any>>(kSQL);

	const [rawReport] = await sql<[RawReport]>`
		select * 
		from reports
		where guild_id = ${guildId}
			and target_id = ${targetId}
			and status = ${ReportStatus.Pending}
		order by created_at desc
		limit 1
	`;

	if (!rawReport) {
		return null;
	}

	return transformReport(rawReport);
}
