import { SNOWFLAKE_MIN_LENGTH, kSQL, container } from "@yuudachi/framework";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import type { RawAppeal } from "./transformAppeal.js";

dayjs.extend(relativeTime);

export async function findAppeals(phrase: string, guildId: Snowflake) {
	const sql = container.get<Sql<any>>(kSQL);

	if (!phrase.length) {
		return sql<RawAppeal[]>`
			select *
			from appeals
			where guild_id = ${guildId}
			order by created_at desc
			limit 25
		`;
	}

	if (!Number.isNaN(Number.parseInt(phrase, 10)) && phrase.length < SNOWFLAKE_MIN_LENGTH) {
		return sql<RawAppeal[]>`
			select *
			from appeals
			where guild_id = ${guildId}
			and appeal_id = ${phrase}
		`;
	}

	return sql<RawAppeal[]>`
		select *
		from appeals
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
