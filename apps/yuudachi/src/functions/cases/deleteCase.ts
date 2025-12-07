import { kSQL, container } from "@yuudachi/framework";
import type { Guild, PartialUser, Snowflake, User } from "discord.js";
import type { Sql } from "postgres";
import { generateCasePayload } from "../logging/generateCasePayload.js";
import { CaseAction, createCase } from "./createCase.js";
import type { RawCase } from "./transformCase.js";

type DeleteCaseOptions = {
	action?: CaseAction | undefined;
	appealReference?: number | undefined;
	caseId?: number | undefined;
	guild: Guild;
	manual?: boolean | undefined;
	messageId?: Snowflake | undefined;
	reason?: string | null | undefined;
	reportReference?: number | undefined;
	skipAction?: boolean | undefined;
	target?: User | undefined;
	user?: PartialUser | User | null | undefined;
};

export async function deleteCase({
	guild,
	user = null,
	target,
	caseId,
	reason,
	manual = false,
	skipAction = false,
	action = undefined,
	reportReference = undefined,
	appealReference = undefined,
}: DeleteCaseOptions) {
	const sql = container.get<Sql<any>>(kSQL);

	let case_: RawCase | undefined;
	let localReason = reason;

	if (target) {
		[case_] = await sql<[RawCase]>`
			select *
			from cases
			where guild_id = ${guild.id}
				and target_id = ${target.id}
				and action = ${action ?? CaseAction.Ban}
			order by created_at desc
			limit 1
		`;
	}

	if (!target) {
		[case_] = await sql<[RawCase]>`
			select *
			from cases
			where guild_id = ${guild.id}
				and case_id = ${caseId!}
		`;
	}

	if (case_?.action === CaseAction.Role) {
		await sql`
			update cases
			set action_processed = true
			where guild_id = ${guild.id}
				and case_id = ${case_.case_id}
		`;

		if (manual) {
			localReason = "Manual unrole";
		} else {
			localReason = "Automatic unrole based on duration";
		}
	}

	if (case_?.action === CaseAction.Timeout) {
		await sql`
			update cases
			set action_processed = true
			where guild_id = ${guild.id}
				and case_id = ${case_.case_id}
		`;

		if (manual) {
			localReason = "Manually ended timeout";
		} else {
			localReason = "Timeout expired based on duration";
		}
	}

	const case_action = case_?.action ?? CaseAction.Ban;

	return createCase(
		guild,
		generateCasePayload({
			guildId: guild.id,
			user,
			roleId: case_?.role_id,
			args: {
				reason: localReason,
				user: {
					user: await guild.client.users.fetch(case_?.target_id ?? target!.id),
					member: await guild.members.fetch(case_?.target_id ?? target!.id).catch(() => null),
				},
				case_reference: case_?.case_id,
				report_reference: reportReference,
				appeal_reference: appealReference,
			},
			action:
				case_action === CaseAction.Ban
					? CaseAction.Unban
					: case_action === CaseAction.Role
						? CaseAction.Unrole
						: CaseAction.TimeoutEnd,
		}),
		skipAction,
	);
}
