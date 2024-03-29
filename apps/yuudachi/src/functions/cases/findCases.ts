import { SNOWFLAKE_MIN_LENGTH, kSQL, container } from "@yuudachi/framework";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import type { RawCase } from "./transformCase.js";

dayjs.extend(relativeTime);

export async function findCases(phrase: string, guildId: Snowflake) {
	const sql = container.resolve<Sql<{}>>(kSQL);

	if (!phrase.length) {
		return sql<RawCase[]>`
			select *
			from cases
			where guild_id = ${guildId}
			order by created_at desc
			limit 25
		`;
	}

	if (!Number.isNaN(Number.parseInt(phrase, 10)) && phrase.length < SNOWFLAKE_MIN_LENGTH) {
		return sql<RawCase[]>`
			select *
			from cases
			where guild_id = ${guildId}
			and case_id = ${phrase}
		`;
	}

	return sql<RawCase[]>`
		select *
		from cases
		where guild_id = ${guildId}
			and (
				target_id = ${phrase}
				or target_tag ilike ${`%${phrase}%`}
				or reason ilike ${`%${phrase}%`}
			)
		order by created_at desc
		limit 25
	`;
}
