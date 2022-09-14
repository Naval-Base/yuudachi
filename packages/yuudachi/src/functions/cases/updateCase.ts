import type { Sql } from "postgres";
import { container } from "tsyringe";
import { kSQL } from "../../tokens.js";
import { removeUndefinedKeys } from "../../util/object.js";
import type { CreateCase } from "./createCase.js";
import { type RawCase, transformCase } from "./transformCase.js";

export type PatchCase = Pick<
	CreateCase,
	"actionExpiration" | "caseId" | "contextMessageId" | "guildId" | "reason" | "refId" | "reportRefId"
>;

export async function updateCase(case_: PatchCase) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const queries: Partial<Record<keyof RawCase, unknown>> = {
		action_expiration: case_.actionExpiration,
		reason: case_.reason,
		context_message_id: case_.contextMessageId,
		ref_id: case_.refId,
		report_ref_id: case_.reportRefId,
	};

	const updates = removeUndefinedKeys(queries);

	const [updatedCase] = await sql<[RawCase]>`
		update cases set ${sql(updates as Record<string, unknown>, ...Object.keys(updates))}
		where guild_id = ${case_.guildId}
			and case_id = ${case_.caseId!}
		returning *
	`;

	return transformCase(updatedCase);
}
