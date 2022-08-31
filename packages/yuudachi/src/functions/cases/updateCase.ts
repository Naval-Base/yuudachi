import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';
import type { CreateCase } from './createCase.js';
import { type RawCase, transformCase } from './transformCase.js';

export type PatchCase = Pick<
	CreateCase,
	'actionExpiration' | 'caseId' | 'contextMessageId' | 'guildId' | 'reason' | 'refId'
>;

export async function updateCase(case_: PatchCase) {
	const sql = container.resolve<Sql<any>>(kSQL);

	if (case_.actionExpiration) {
		await sql`
			update cases
			set action_expiration = ${case_.actionExpiration}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId!}
		`;
	}

	if (case_.reason) {
		await sql`
			update cases
			set reason = ${case_.reason}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId!}
		`;
	}

	if (case_.contextMessageId) {
		await sql`
			update cases
			set context_message_id = ${case_.contextMessageId}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId!}
		`;
	}

	if (case_.refId) {
		await sql`
			update cases
			set ref_id = ${case_.refId}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId!}
		`;
	}

	const [updatedCase] = await sql<[RawCase]>`
		select *
		from cases
		where guild_id = ${case_.guildId}
			and case_id = ${case_.caseId!}
	`;

	return transformCase(updatedCase);
}
