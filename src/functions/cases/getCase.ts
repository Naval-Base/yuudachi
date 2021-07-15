import type { Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import { RawCase, transformCase } from './transformCase';

export async function getCase(guildId: Snowflake, caseId: number) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [case_] = await sql<[RawCase?]>`
		select *
		from cases
		where guild_id = ${guildId}
			and case_id = ${caseId}`;

	if (!case_) {
		return null;
	}

	return transformCase(case_);
}
