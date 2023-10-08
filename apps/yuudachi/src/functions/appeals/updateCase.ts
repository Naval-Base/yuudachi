import { kSQL, removeUndefinedKeys, container } from "@yuudachi/framework";
import type { User } from "discord.js";
import type { Sql } from "postgres";
import type { CreateAppeal } from "./createAppeal.js";
import { type RawAppeal, transformAppeal } from "./transformAppeal.js";

export type PatchAppeal = Pick<Partial<CreateAppeal>, "appealId" | "guildId" | "reason" | "refId" | "status">;

export async function updateAppeal(appeal: PatchAppeal, moderator?: User) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const updates: Partial<Record<keyof RawAppeal, unknown>> = {
		status: appeal.status,
		reason: appeal.reason,
		ref_id: appeal.refId,
		mod_id: moderator?.id,
		mod_tag: moderator?.tag,
	};

	const queries = removeUndefinedKeys(updates);

	const [updatedAppeal] = await sql<[RawAppeal]>`
		update appeals set ${sql(queries as Record<string, unknown>, ...Object.keys(queries))}
		where guild_id = ${appeal.guildId}
			and appeal_id = ${appeal.appealId!}
		returning *
	`;

	return transformAppeal(updatedAppeal);
}
