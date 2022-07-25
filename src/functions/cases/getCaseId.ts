import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';

interface RawCaseId {
	case_id: number,
}

export async function getCaseId(guildId: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [case_] = await sql<[RawCaseId]>`
		select next_case(${guildId}) as case_id
		from cases 
		limit 1;`

	return case_.case_id;
}