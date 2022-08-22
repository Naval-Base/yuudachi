import type { Guild, GuildMember, Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import type { CamelCasedProperties } from "type-fest";
import { logger } from "../../logger.js";
import { kSQL } from "../../tokens.js";
import type { PartialAndUndefinedOnNull } from "../../util/types.js";
import { upsertReportLog } from "../logging/upsertReportLog.js";
import { ReportStatus } from "../reports/createReport.js";
import { getReport } from "../reports/getReport.js";
import { updateReport } from "../reports/updateReport.js";
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

export type Case = {
	accountCutoff?: string | null | undefined;
	action: CaseAction;
	actionExpiration?: string | null | undefined;
	actionProcessed: boolean;
	caseId: number;
	caseReferenceId?: number | null | undefined;
	contextMessageId?: Snowflake | null | undefined;
	createdAt: string;
	deleteMessageDays?: number | undefined;
	guildId: Snowflake;
	joinCutoff?: string | null | undefined;
	logMessageId?: Snowflake | null | undefined;
	moderatorId: Snowflake;
	moderatorTag: string;
	multi: boolean;
	reason?: string | null | undefined;
	reportReferenceId?: number | null | undefined;
	roleId?: Snowflake | null | undefined;
	targetId: Snowflake;
	targetTag: string;
};

export type CreateCase = Omit<
	Case,
	"actionExpiration" | "actionProcessed" | "caseId" | "createdAt" | "logMessageId" | "modId" | "modTag" | "multi"
> & {
	actionExpiration?: Date | null | undefined;
	caseId?: number | null | undefined;
	caseReferenceId?: number | null | undefined;
	contextMessageId?: Snowflake | null | undefined;
	modId?: Snowflake | undefined;
	modTag?: string | undefined;
	multi?: boolean | null | undefined;
	reason?: string | null | undefined;
	refId?: number | null | undefined;
	reportRef?: number | null | undefined;
	reportReferenceId?: number | null | undefined;
	target?: GuildMember | null | undefined;
	targetId: Snowflake;
	targetTag: string;
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
			report_ref,
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
			${case_.reportRef ?? null},
			${case_.multi ?? false}
		)
		returning *
	`;

	try {
		if (case_.reportRef) {
			const preReport = await getReport(case_.guildId, case_.reportRef);

			const report = await updateReport(
				{
					guildId: case_.guildId,
					reportId: case_.reportRef,
					refId: newCase.case_id,
					status: preReport!.authorId === case_.targetId ? ReportStatus.Spam : ReportStatus.Approved,
				},
				guild.client.users.cache.get(case_.modId!),
			);

			await upsertReportLog(guild, report);
		}
	} catch (error_) {
		const error = error_ as Error;
		logger.error(error, error.message);
	}

	return transformCase(newCase);
}
