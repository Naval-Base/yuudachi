import type { Guild, GuildMember, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import { RawCase, transformCase } from './transformCase';
import { logger } from '../../logger';

export enum CaseAction {
	Role,
	Unrole,
	Warn,
	Kick,
	Softban,
	Ban,
	Unban,
}

export interface Case {
	caseId: number;
	guildId: Snowflake;
	action: CaseAction;
	roleId?: Snowflake | null;
	actionExpiration?: string | null;
	reason?: string | null;
	moderatorId: Snowflake;
	moderatorTag: string;
	targetId: Snowflake;
	targetTag: string;
	deleteMessageDays?: number;
	contextMessageId?: Snowflake | null;
	referenceId?: number | null;
	logMessageId?: Snowflake | null;
	actionProcessed: boolean;
	multi: boolean;
	joinCutoff?: string | null;
	accountCutoff?: string | null;
	createdAt: string;
}

export interface CreateCase {
	caseId?: number;
	guildId: Snowflake;
	action: CaseAction;
	roleId?: Snowflake | null;
	actionExpiration?: Date | null;
	reason?: string | null;
	moderatorId?: Snowflake;
	moderatorTag?: string;
	targetId: Snowflake;
	targetTag: string;
	deleteMessageDays?: number;
	contextMessageId?: Snowflake | null;
	referenceId?: number | null;
	multi?: boolean | null;
	joinCutoff?: Date | null;
	accountCutoff?: Date | null;
}

export async function createCase(
	guild: Guild,
	case_: CreateCase & { target?: GuildMember | null },
	skipAction = false,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	let reason;
	if (case_.moderatorTag) {
		reason = `Mod: ${case_.moderatorTag}${case_.reason ? ` | ${case_.reason.replace(/`/g, '')}` : ''}`;
	}
	try {
		if (!skipAction) {
			switch (case_.action) {
				case CaseAction.Role:
					await case_.target!.roles.add(case_.roleId!, reason);
					break;
				case CaseAction.Unrole:
					await case_.target!.roles.remove(case_.roleId!, reason);
					break;
				case CaseAction.Warn:
					break;
				case CaseAction.Kick:
					await case_.target!.kick(reason);
					break;
				case CaseAction.Softban: {
					await guild.bans.create(case_.targetId, { days: case_.deleteMessageDays ?? 1, reason });
					await guild.bans.remove(case_.targetId, reason);
					break;
				}
				case CaseAction.Ban: {
					await guild.bans.create(case_.targetId, { days: case_.deleteMessageDays ?? 0, reason });
					break;
				}
				case CaseAction.Unban:
					await guild.bans.remove(case_.targetId, reason);
					break;
			}
		}
	} catch (e) {
		logger.error(e);
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
