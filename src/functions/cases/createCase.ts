import type { ButtonInteraction, CommandInteraction, GuildMember, SelectMenuInteraction, Snowflake } from 'discord.js';
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
	actionExpiration?: Date | null;
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
	createdAt?: string;
}

export interface CreateCase {
	guildId: Snowflake;
	action: CaseAction;
	roleId?: Snowflake | null;
	actionExpiration?: Date | null;
	reason?: string | null;
	moderatorId: Snowflake;
	moderatorTag: string;
	targetId: Snowflake;
	targetTag: string;
	deleteMessageDays?: number;
	contextMessageId?: Snowflake | null;
	referenceId?: number | null;
}

export async function createCase(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	case_: CreateCase & { target?: GuildMember },
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const reason = `Mod: ${case_.moderatorTag}${case_.reason ? ` | ${case_.reason}` : ''}`;
	try {
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
				await interaction.guild!.bans.create(case_.targetId, { days: case_.deleteMessageDays ?? 1, reason });
				await interaction.guild!.bans.remove(case_.targetId, reason);
				break;
			}
			case CaseAction.Ban: {
				await interaction.guild!.bans.create(case_.targetId, { days: case_.deleteMessageDays ?? 0, reason });
				break;
			}
			case CaseAction.Unban:
				await interaction.guild!.bans.remove(case_.targetId, reason);
				break;
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
			ref_id
		) values (
			next_case(${case_.guildId}),
			${case_.guildId},
			${case_.moderatorId},
			${`${case_.moderatorTag}`},
			${case_.targetId},
			${`${case_.targetTag}`},
			${case_.action},
			${case_.roleId ?? null},
			${case_.actionExpiration?.toISOString() ?? null},
			${case_.actionExpiration ? false : true},
			${case_.reason ?? null},
			${case_.contextMessageId ?? null},
			${case_.referenceId ?? null}
		)
		returning *`;

	return transformCase(newCase);
}
