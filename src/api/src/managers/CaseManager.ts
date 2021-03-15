import { RESTGetAPIUserResult, Routes } from 'discord-api-types/v8';
import { Sql } from 'postgres';
import Rest from '@yuudachi/rest';
import { Case, CaseAction } from '@yuudachi/types';
import { inject, injectable } from 'tsyringe';
import { Tokens } from '@yuudachi/core';

const { kSQL } = Tokens;

export interface RawCase {
	action_expiration: string | null;
	ref_id: number | null;
	action_processed: boolean;
	target_id: `${bigint}`;
	action: number;
	role_id: `${bigint}` | null;
	case_id: number;
	context_message_id: `${bigint}` | null;
	mod_id: `${bigint}`;
	target_tag: string;
	reason: string;
	log_message_id: `${bigint}` | null;
	created_at: string;
	mod_tag: string;
	guild_id: `${bigint}`;
}

export type PatchCase = Pick<
	Case,
	'guildId' | 'caseId' | 'actionExpiration' | 'reason' | 'contextMessageId' | 'referenceId'
>;

@injectable()
export default class CaseManager {
	public constructor(
		@inject(kSQL)
		public readonly sql: Sql<any>,
		public readonly rest: Rest,
	) {}

	public async create(case_: Case) {
		const [target, mod]: [RESTGetAPIUserResult, RESTGetAPIUserResult] = await Promise.all([
			this.rest.get<RESTGetAPIUserResult>(Routes.user(case_.targetId)),
			this.rest.get<RESTGetAPIUserResult>(Routes.user(case_.moderatorId)),
		]);

		const requestOptions = {
			reason: `Mod: ${mod.username}#${mod.discriminator}${case_.reason ? ` | ${case_.reason}` : ''}`,
		};
		switch (case_.action) {
			case CaseAction.ROLE:
				await this.rest.put(Routes.guildMemberRole(case_.guildId, case_.targetId, case_.roleId!), {}, requestOptions);
				break;
			case CaseAction.UNROLE:
				await this.rest.delete(Routes.guildMemberRole(case_.guildId, case_.targetId, case_.roleId!), requestOptions);
				break;
			case CaseAction.WARN:
				break;
			case CaseAction.KICK:
				await this.rest.delete(Routes.guildMember(case_.guildId, case_.targetId), requestOptions);
				break;
			case CaseAction.SOFTBAN: {
				await this.rest.put(Routes.guildBan(case_.guildId, case_.targetId), {
					...requestOptions,
					delete_message_days: case_.deleteMessageDays ?? 1,
				});
				await this.rest.delete(Routes.guildBan(case_.guildId, case_.targetId), requestOptions);
				break;
			}
			case CaseAction.BAN: {
				await this.rest.put(Routes.guildBan(case_.guildId, case_.targetId), {
					...requestOptions,
					delete_message_days: case_.deleteMessageDays ?? 0,
				});
				break;
			}
			case CaseAction.UNBAN:
				await this.rest.delete(Routes.guildBan(case_.guildId, case_.targetId), requestOptions);
				break;
		}

		const [newCase] = await this.sql`
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
				${`${mod.username}#${mod.discriminator}`},
				${case_.targetId},
				${`${target.username}#${target.discriminator}`},
				${case_.action},
				${case_.roleId ?? null},
				${case_.actionExpiration?.toISOString() ?? null},
				${case_.actionExpiration ? false : true},
				${case_.reason ?? null},
				${case_.contextMessageId ?? null},
				${case_.referenceId ?? null}
			)
			returning case_id`;

		case_.caseId = newCase.case_id;
		return case_;
	}

	public async update(case_: PatchCase) {
		if (case_.actionExpiration) {
			await this.sql`
				update cases
				set action_expiration = ${case_.actionExpiration.toISOString()}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		if (case_.reason) {
			await this.sql`
				update cases
				set reason = ${case_.reason}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		if (case_.contextMessageId) {
			await this.sql`
				update cases
				set context_message_id = ${case_.contextMessageId}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		if (case_.referenceId) {
			await this.sql`
				update cases
				set ref_id = ${case_.referenceId}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		const [updatedCase] = await this.sql`
			select *
			from cases
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId}`;

		return updatedCase as Case;
	}

	public async delete(guildId: `${bigint}`, caseId: number, manual = false) {
		const [case_] = await this.sql<RawCase[]>`
			select *
			from cases
			where guild_id = ${guildId}
				and case_id = ${caseId}`;

		await this.sql`
			update cases
			set action_processed = true
			where guild_id = ${guildId}
				and case_id = ${caseId}`;

		let reason;
		if (manual) {
			if (case_.action === CaseAction.BAN) {
				reason = 'Manual unban';
			} else {
				reason = 'Manual unrole';
			}
		} else if (case_.action === CaseAction.BAN) {
			reason = 'Automatic unban based on duraton';
		} else {
			reason = 'Automatic unrole based on duration';
		}

		return this.create({
			guildId: case_.guild_id,
			targetId: case_.target_id,
			moderatorId: case_.mod_id,
			action: case_.action === CaseAction.BAN ? CaseAction.UNBAN : CaseAction.UNROLE,
			roleId: case_.role_id!,
			reason,
			contextMessageId: case_.context_message_id!,
			referenceId: case_.case_id,
		} as Case);
	}
}
