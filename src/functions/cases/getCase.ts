import type { Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { type RawCase, transformCase } from './transformCase.js';
import { kSQL } from '../../tokens.js';

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
