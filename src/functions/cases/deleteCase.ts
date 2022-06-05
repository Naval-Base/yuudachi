import type { Guild, Snowflake, User } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { CaseAction, createCase } from './createCase.js';
import type { RawCase } from './transformCase.js';
import { kSQL } from '../../tokens.js';
import { generateCasePayload } from '../logs/generateCasePayload.js';

interface DeleteCaseOptions {
	guild: Guild;
	user?: User | null;
	messageId?: Snowflake;
	target?: User;
	caseId?: number;
	reason?: string | null;
	manual?: boolean;
	skipAction?: boolean;
	action?: CaseAction;
}

export async function deleteCase({
	guild,
	user = null,
	target,
	caseId,
	reason,
	manual = false,
	skipAction = false,
	action = undefined,
}: DeleteCaseOptions) {
	const sql = container.resolve<Sql<any>>(kSQL);

	let case_: RawCase | undefined;
	if (target) {
		[case_] = await sql<[RawCase]>`
			select *
			from cases
			where guild_id = ${guild.id}
				and target_id = ${target.id}
				and action = ${action ?? CaseAction.Ban}
			order by created_at desc
			limit 1`;
	}

	if (!target) {
		[case_] = await sql<[RawCase]>`
			select *
			from cases
			where guild_id = ${guild.id}
				and case_id = ${caseId!}`;
	}

	if (case_?.action === CaseAction.Role) {
		await sql`
			update cases
			set action_processed = true
			where guild_id = ${guild.id}
				and case_id = ${case_.case_id}`;

		if (manual) {
			reason = 'Manual unrole';
		} else {
			reason = 'Automatic unrole based on duration';
		}
	}

	if (case_?.action === CaseAction.Timeout) {
		await sql`
			update cases
			set action_processed = true
			where guild_id = ${guild.id}
				and case_id = ${case_.case_id}`;

		if (manual) {
			reason = 'Manually ended timeout';
		} else {
			reason = 'Timeout expired based on duration';
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
				reason,
				user: {
					user: await guild.client.users.fetch(case_?.target_id ?? target!.id),
					member: await guild.members.fetch(case_?.target_id ?? target!.id).catch(() => null),
				},
				reference: case_?.case_id,
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
