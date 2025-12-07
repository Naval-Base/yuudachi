import { SNOWFLAKE_MIN_LENGTH, kSQL, container } from "@yuudachi/framework";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import type { RawReport } from "./transformReport.js";

dayjs.extend(relativeTime);

export async function findReports(phrase: string, guildId: Snowflake) {
	const sql = container.get<Sql<any>>(kSQL);

	if (!phrase.length) {
		return sql<RawReport[]>`
			select *
			from reports
			where guild_id = ${guildId}
			order by created_at desc
			limit 25
		`;
	}

	if (!Number.isNaN(Number.parseInt(phrase, 10)) && phrase.length < SNOWFLAKE_MIN_LENGTH) {
		return sql<RawReport[]>`
			select *
			from reports
			where guild_id = ${guildId}
			and report_id = ${phrase}
		`;
	}

	return sql<RawReport[]>`
		select *
		from reports
		where guild_id = ${guildId}
			and (
				author_id = ${phrase}
				or author_tag ilike ${`%${phrase}%`}
				or target_id = ${phrase}
				or target_tag ilike ${`%${phrase}%`}
				or reason ilike ${`%${phrase}%`}
			)
		order by created_at desc
		limit 25
	`;
}
