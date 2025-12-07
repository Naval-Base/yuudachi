import { kSQL, container } from "@yuudachi/framework";
import type { PartialAndUndefinedOnNull } from "@yuudachi/framework/types";
import type { Sql } from "postgres";
import type { CamelCasedProperties } from "type-fest";
import { type RawAppeal, transformAppeal } from "./transformAppeal.js";

export type Appeal = PartialAndUndefinedOnNull<CamelCasedProperties<RawAppeal>>;

export type CreateAppeal = Omit<Appeal, "appealId" | "createdAt" | "status"> & {
	appealId?: number | null | undefined;
	createdAt?: Date | null | undefined;
	status?: AppealStatus | null | undefined;
};

export enum AppealStatus {
	Pending,
	Approved,
	Rejected,
}

export async function createAppeal(appeal: CreateAppeal): Promise<Appeal> {
	const sql = container.get<Sql<any>>(kSQL);

	const [rawAppeal] = await sql<[RawAppeal]>`
		insert into appeals (
			appeal_id,
			guild_id,
			status,
			target_id,
			target_tag,
			reason,
			ref_id,
		) values (
			next_appeal(${appeal.guildId}),
			${appeal.guildId},
			${appeal.status ?? AppealStatus.Pending},
			${appeal.targetId},
			${appeal.targetTag},
			${appeal.reason},
			${appeal.refId ?? null},
		) returning *;
	`;

	return transformAppeal(rawAppeal);
}
