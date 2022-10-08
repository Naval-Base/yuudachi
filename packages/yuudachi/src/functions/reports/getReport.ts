import { kSQL, container } from "@yuudachi/framework";
import type { Sql } from "postgres";
import { type RawReport, transformReport } from "./transformReport.js";

export async function getReport(guildId: string, reportId: number) {
	const sql = container.resolve<Sql<any>>(kSQL);

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
