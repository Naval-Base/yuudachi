import { APIUser } from 'discord-api-types';
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
	target_id: string;
	action: number;
	role_id: string | null;
	case_id: number;
	context_message_id: string | null;
	mod_id: string;
	target_tag: string;
	reason: string;
	log_message_id: string | null;
	created_at: string;
	mod_tag: string;
	guild_id: string;
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
		const [target, mod]: [APIUser, APIUser] = await Promise.all([
			this.rest.get<APIUser>(`/users/${case_.targetId}`),
			this.rest.get<APIUser>(`/users/${case_.moderatorId}`),
		]);

		const requestOptions = {
			reason: `Mod: ${mod.username}#${mod.discriminator}${case_.reason ? ` | ${case_.reason}` : ''}`,
		};
		switch (case_.action) {
			case CaseAction.ROLE:
				await this.rest.put(
					`/guilds/${case_.guildId}/members/${case_.targetId}/roles/${case_.roleId!}`,
					{},
					requestOptions,
				);
				break;
			case CaseAction.UNROLE:
				await this.rest.delete(
					`/guilds/${case_.guildId}/members/${case_.targetId}/roles/${case_.roleId!}`,
					requestOptions,
				);
				break;
			case CaseAction.WARN:
				break;
			case CaseAction.KICK:
				await this.rest.delete(`/guilds/${case_.guildId}/members/${case_.targetId}`, requestOptions);
				break;
			case CaseAction.SOFTBAN: {
				await this.rest.put(`/guilds/${case_.guildId}/bans/${case_.targetId}`, {
					...requestOptions,
					delete_message_days: case_.deleteMessageDays ?? 1,
				});
				await this.rest.delete(`/guilds/${case_.guildId}/bans/${case_.targetId}`, requestOptions);
				break;
			}
			case CaseAction.BAN: {
				await this.rest.put(`/guilds/${case_.guildId}/bans/${case_.targetId}`, {
					...requestOptions,
					delete_message_days: case_.deleteMessageDays ?? 0,
				});
				break;
			}
			case CaseAction.UNBAN:
				await this.rest.delete(`/guilds/${case_.guildId}/bans/${case_.targetId}`, requestOptions);
				break;
		}

		const [newCase] = await this.sql`
			insert into moderation.cases (
				case_id,
				guild_id,
				mod_id,
				mod_tag,
				target_id,
				target_tag,
				action,
				role_id,
				action_expiration,
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
				update moderation.cases
				set action_expiration = ${case_.actionExpiration.toISOString()}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		if (case_.reason) {
			await this.sql`
				update moderation.cases
				set reason = ${case_.reason}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		if (case_.contextMessageId) {
			await this.sql`
				update moderation.cases
				set context_message_id = ${case_.contextMessageId}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		if (case_.referenceId) {
			await this.sql`
				update moderation.cases
				set ref_id = ${case_.referenceId}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}`;
		}

		const [updatedCase] = await this.sql`
			select *
			from moderation.cases
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId}`;

		return updatedCase as Case;
	}
}
