import type { Guild, GuildMember, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { type RawCase, transformCase } from './transformCase.js';
import { logger } from '../../logger.js';
import { kSQL } from '../../tokens.js';

export enum CaseAction {
	Role,
	Unrole,
	Warn,
	Kick,
	Softban,
	Ban,
	Unban,
	Timeout,
	TimeoutEnd,
}

export interface Case {
	caseId: number;
	guildId: Snowflake;
	action: CaseAction;
	roleId?: Snowflake | undefined | null;
	actionExpiration?: string | undefined | null;
	reason?: string | undefined | null;
	moderatorId: Snowflake;
	moderatorTag: string;
	targetId: Snowflake;
	targetTag: string;
	deleteMessageDays?: number | undefined;
	contextMessageId?: Snowflake | undefined | null;
	referenceId?: number | undefined | null;
	logMessageId?: Snowflake | undefined | null;
	actionProcessed: boolean;
	multi: boolean;
	joinCutoff?: string | undefined | null;
	accountCutoff?: string | undefined | null;
	createdAt: string;
}

export interface CreateCase {
	caseId?: number | undefined;
	guildId: Snowflake;
	action: CaseAction;
	roleId?: Snowflake | undefined | null;
	actionExpiration?: Date | undefined | null;
	reason?: string | undefined | null;
	moderatorId?: Snowflake | undefined;
	moderatorTag?: string | undefined;
	targetId: Snowflake;
	targetTag: string;
	deleteMessageDays?: number;
	contextMessageId?: Snowflake | undefined | null;
	referenceId?: number | undefined | null;
	multi?: boolean | undefined | null;
	joinCutoff?: Date | undefined | null;
	accountCutoff?: Date | undefined | null;
}

export async function createCase(
	guild: Guild,
	case_: CreateCase & { target?: GuildMember | undefined | null },
	skipAction = false,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const reason = case_.moderatorTag
		? `Mod: ${case_.moderatorTag}${case_.reason ? ` | ${case_.reason.replace(/`/g, '')}` : ''}`
		: case_.reason ?? undefined;

	try {
		if (!skipAction) {
			switch (case_.action) {
				case CaseAction.Role:
					await case_.target!.roles.add(case_.roleId!, reason);
					break;
				case CaseAction.Unrole:
					await case_.target!.roles.remove(case_.roleId!, reason);
					break;
				case CaseAction.TimeoutEnd:
				case CaseAction.Warn:
					break;
				case CaseAction.Kick:
					await case_.target!.kick(reason);
					break;
				case CaseAction.Softban: {
					await guild.bans.create(case_.targetId, { deleteMessageDays: case_.deleteMessageDays ?? 1, reason });
					await guild.bans.remove(case_.targetId, reason);
					break;
				}
				case CaseAction.Ban: {
					await guild.bans.create(case_.targetId, { deleteMessageDays: case_.deleteMessageDays ?? 0, reason });
					break;
				}
				case CaseAction.Unban:
					await guild.bans.remove(case_.targetId, reason);
					break;
				case CaseAction.Timeout:
					await case_.target!.disableCommunicationUntil(case_.actionExpiration!, reason);
					break;
			}
		}
	} catch (e) {
		const error = e as Error;
		logger.error(error, error.message);
	}

	const [newCase] = await sql<[RawCase]>`
		insert into cases (
			case_id,
			guild_id,
			mod_id,
			mod_tag,
			target_id,
			target_tag,
			action,
			role_id,
			action_expiration,
			action_processed,
			reason,
			context_message_id,
			ref_id,
			multi,
			join_cutoff,
			account_cutoff
		) values (
			next_case(${case_.guildId}),
			${case_.guildId},
			${case_.moderatorId ?? null},
			${case_.moderatorTag ?? null},
			${case_.targetId},
			${case_.targetTag},
			${case_.action},
			${case_.roleId ?? null},
			${case_.actionExpiration ?? null},
			${case_.actionExpiration ? false : true},
			${case_.reason ?? null},
			${case_.contextMessageId ?? null},
			${case_.referenceId ?? null},
			${case_.multi ?? false},
			${case_.joinCutoff ?? null},
			${case_.accountCutoff ?? null}
		)
		returning *`;

	return transformCase(newCase);
}
