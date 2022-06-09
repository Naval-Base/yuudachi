import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { SNOWFLAKE_MIN_LENGTH } from '../Constants.js';
import type { RawCase } from '../functions/cases/transformCase.js';
import { kSQL } from '../tokens.js';

dayjs.extend(relativeTime);

export async function findCases(phrase: string, guildId: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	if (!phrase.length) {
		return sql<RawCase[]>`
		select *
		from cases
		where guild_id = ${guildId}
		order by created_at desc
		limit 25`;
	}

	if (!isNaN(parseInt(phrase, 10)) && phrase.length < SNOWFLAKE_MIN_LENGTH) {
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
	limit 25`;
}
