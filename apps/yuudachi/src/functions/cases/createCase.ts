import { logger, kSQL, container } from "@yuudachi/framework";
import type { PartialAndUndefinedOnNull } from "@yuudachi/framework/types";
import type { Guild, GuildMember, Snowflake } from "discord.js";
import type { Sql } from "postgres";
import type { CamelCasedProperties } from "type-fest";
import { resolvePendingReports } from "../reports/resolveReports.js";
import { type RawCase, transformCase } from "./transformCase.js";
import { updateCase } from "./updateCase.js";

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
	contextMessageId?: Snowflake | null | undefined;
	deleteMessageDays?: number | null | undefined;
	modId?: Snowflake | null | undefined;
	modTag?: string | null | undefined;
	multi?: boolean | null | undefined;
	target?: GuildMember | null | undefined;
};

// If used in the Constants file, the import loop would raise an error
const REPORT_AUTO_RESOLVE_IGNORE_ACTIONS = [CaseAction.TimeoutEnd, CaseAction.Unban];

export async function createCase(
	guild: Guild,
	case_: CreateCase & { target?: GuildMember | null | undefined },
	skipAction = false,
) {
	const sql = container.get<Sql<any>>(kSQL);

	const reason = case_.modTag
		? `Mod: ${case_.modTag}${case_.reason ? ` | ${case_.reason.replaceAll("`", "")}` : ""}`
		: (case_.reason ?? undefined);

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
			report_ref_id,
			appeal_ref_id,
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
			${case_.reportRefId ?? null},
			${case_.appealRefId ?? null},
			${case_.multi ?? false}
		)
		returning *
	`;

	if (!REPORT_AUTO_RESOLVE_IGNORE_ACTIONS.includes(case_.action)) {
		try {
			const resolvedReports = await resolvePendingReports(
				guild,
				case_.targetId,
				newCase.case_id,
				await guild.client.users.fetch(newCase.mod_id),
			);

			if (resolvedReports.length && !case_.reportRefId) {
				return await updateCase({
					caseId: newCase.case_id,
					guildId: newCase.guild_id,
					reportRefId: resolvedReports.at(-1)!.report_id,
				});
			}
		} catch (error_) {
			const error = error_ as Error;
			logger.error(error, error.message);
		}
	}

	return transformCase(newCase);
}
