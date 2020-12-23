import { Case, CreateCase, UpdateCase, Lockdown, CreateLockdown, DeleteLockdown } from '@yuudachi/types';
import { RESTGetAPICurrentUserGuildsResult, RESTGetAPIGuildRolesResult } from 'discord-api-types';
import API from '..';

export default class Guilds {
	public constructor(private readonly api: API) {}

	public get() {
		return this.api.make<RESTGetAPICurrentUserGuildsResult>('get', '/guilds');
	}

	public getOAuth(userId: string) {
		return this.api.make<RESTGetAPICurrentUserGuildsResult>('get', '/guilds/oauth', undefined, {
			'x-hasura-user-id': userId,
		});
	}

	public getRoles(guildId: string) {
		return this.api.make<RESTGetAPIGuildRolesResult>('get', `/guilds/${guildId}/roles`);
	}

	public createCase(guildId: string, ...cases: CreateCase[]) {
		return this.api.make<Case[]>('post', `/guilds/${guildId}/cases`, { cases });
	}

	public updateCase(guildId: string, ...cases: UpdateCase[]) {
		return this.api.make<Case[]>('patch', `/guilds/${guildId}/cases`, { cases });
	}

	public deleteCase(guildId: string, caseId: number) {
		return this.api.make<Case[]>('delete', `/guilds/${guildId}/cases/${caseId}`);
	}

	public createLockdown(guildId: string, ...lockdowns: CreateLockdown[]) {
		return this.api.make<Lockdown[]>('post', `/guilds/${guildId}/lockdowns`, { lockdowns });
	}

	public deleteLockdown(guildId: string, ...lockdowns: DeleteLockdown[]) {
		return this.api.make<Lockdown[]>('delete', `/guilds/${guildId}/lockdowns`, { lockdowns });
	}
}
