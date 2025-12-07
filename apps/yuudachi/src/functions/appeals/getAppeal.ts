import { kSQL, container } from "@yuudachi/framework";
import type { Sql } from "postgres";
import { type RawAppeal, transformAppeal } from "./transformAppeal.js";

export async function getAppeal(guildId: string, reportId: number) {
	const sql = container.get<Sql<any>>(kSQL);

	const [rawAppeal] = await sql<[RawAppeal?]>`
		select *
		from appeals
		where guild_id = ${guildId}
			and appeal_id = ${reportId};
	`;

	if (!rawAppeal) {
		return null;
	}

	return transformAppeal(rawAppeal);
}
