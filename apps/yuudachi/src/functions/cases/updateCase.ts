import { kSQL, removeUndefinedKeys, container } from "@yuudachi/framework";
import type { Sql } from "postgres";
import type { CreateCase } from "./createCase.js";
import { type RawCase, transformCase } from "./transformCase.js";

export type PatchCase = Pick<
	CreateCase,
	"actionExpiration" | "appealRefId" | "caseId" | "contextMessageId" | "guildId" | "reason" | "refId" | "reportRefId"
>;

export async function updateCase(case_: PatchCase) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const updates: Partial<Record<keyof RawCase, unknown>> = {
		action_expiration: case_.actionExpiration,
		reason: case_.reason,
		context_message_id: case_.contextMessageId,
		ref_id: case_.refId,
		report_ref_id: case_.reportRefId,
		appeal_ref_id: case_.appealRefId,
	};

	const queries = removeUndefinedKeys(updates);

	const [updatedCase] = await sql<[RawCase]>`
		update cases set ${sql(queries as Record<string, unknown>, ...Object.keys(queries))}
		where guild_id = ${case_.guildId}
			and case_id = ${case_.caseId!}
		returning *
	`;

	return transformCase(updatedCase);
}
