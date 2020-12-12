import { Case, CreateCase } from '@yuudachi/types';
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
}
