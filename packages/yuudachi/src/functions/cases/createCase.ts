import type { Guild, GuildMember, Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import type { CamelCasedProperties } from "type-fest";
import { logger } from "../../logger.js";
import { kSQL } from "../../tokens.js";
import type { PartialAndUndefinedOnNull } from "../../util/types.js";
import { type RawCase, transformCase } from "./transformCase.js";

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

export type Case = PartialAndUndefinedOnNull<CamelCasedProperties<RawCase>>;

export type CreateCase = Omit<
	Case,
	"actionExpiration" | "actionProcessed" | "caseId" | "createdAt" | "logMessageId" | "modId" | "modTag" | "multi"
> & {
	actionExpiration?: Date | null | undefined;
	caseId?: number | null | undefined;
	deleteMessageDays?: number | null | undefined;
	modId?: Snowflake | null | undefined;
	modTag?: string | null | undefined;

	multi?: boolean | null | undefined;
	target?: GuildMember | null | undefined;
};

export async function createCase(
	guild: Guild,
	case_: CreateCase & { target?: GuildMember | null | undefined },
	skipAction = false,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const reason = case_.modTag
		? `Mod: ${case_.modTag}${case_.reason ? ` | ${case_.reason.replaceAll("`", "")}` : ""}`
		: case_.reason ?? undefined;

	try {
		if (!skipAction) {
			switch (case_.action) {
				case CaseAction.Role: {
					await case_.target!.roles.add(case_.roleId!, reason);
					break;
				}

				case CaseAction.Unrole: {
					await case_.target!.roles.remove(case_.roleId!, reason);
					break;
				}

				case CaseAction.TimeoutEnd:
				case CaseAction.Warn:
					break;
				case CaseAction.Kick: {
					await case_.target!.kick(reason);
					break;
				}

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
					await case_.target!.disableCommunicationUntil(case_.actionExpiration ?? null, reason);
					break;

				default:
					break;
			}
		}
	} catch (error_) {
		const error = error_ as Error;
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
			multi
		) values (
			next_case(${case_.guildId}),
			${case_.guildId},
			${case_.modId ?? null},
			${case_.modTag ?? null},
			${case_.targetId},
			${case_.targetTag},
			${case_.action},
			${case_.roleId ?? null},
			${case_.actionExpiration ?? null},
			${!case_.actionExpiration},
			${case_.reason ?? null},
			${case_.contextMessageId ?? null},
			${case_.refId ?? null},
			${case_.multi ?? false}
		)
		returning *
	`;

	return transformCase(newCase);
}
