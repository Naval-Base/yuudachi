import type { Case, CreateCase, UpdateCase, Lockdown, CreateLockdown, DeleteLockdown } from '@yuudachi/types';
import { Constants } from '@yuudachi/core';
import type {
	RESTGetAPICurrentUserGuildsResult,
	RESTGetAPIGuildChannelsResult,
	RESTGetAPIGuildResult,
	RESTGetAPIGuildRolesResult,
	Snowflake,
} from 'discord-api-types/v8';
import API from '..';

const { USER_ID_HEADER } = Constants;

export default class Guilds {
	public constructor(private readonly api: API) {}

	public get() {
		return this.api.make<RESTGetAPICurrentUserGuildsResult>('get', '/guilds');
	}

	public getGuild(guildId: Snowflake) {
		return this.api.make<RESTGetAPIGuildResult>('get', `/guilds/${guildId}`);
	}

	public getOAuth(userId: string) {
		return this.api.make<RESTGetAPICurrentUserGuildsResult>('get', '/guilds/oauth', undefined, {
			[USER_ID_HEADER]: userId,
		});
	}

	public getChannels(guildId: Snowflake) {
		return this.api.make<RESTGetAPIGuildChannelsResult>('get', `/guilds/${guildId}/channels`);
	}

	public getRoles(guildId: Snowflake) {
		return this.api.make<RESTGetAPIGuildRolesResult>('get', `/guilds/${guildId}/roles`);
	}

	public createCase(guildId: Snowflake, ...cases: CreateCase[]) {
		return this.api.make<{ cases: Case[] }>('post', `/guilds/${guildId}/cases`, { cases });
	}

	public updateCase(guildId: Snowflake, ...cases: UpdateCase[]) {
		return this.api.make<{ cases: Case[] }>('patch', `/guilds/${guildId}/cases`, { cases });
	}

	public deleteCase(guildId: Snowflake, caseId: number) {
		return this.api.make<{ case: Case }>('delete', `/guilds/${guildId}/cases/${caseId}`);
	}

	public createLockdown(guildId: Snowflake, ...lockdowns: CreateLockdown[]) {
		return this.api.make<{ lockdowns: Lockdown[] }>('post', `/guilds/${guildId}/lockdowns`, { lockdowns });
	}

	public deleteLockdown(guildId: Snowflake, ...lockdowns: DeleteLockdown[]) {
		return this.api.make<{ lockdown: Lockdown }>('delete', `/guilds/${guildId}/lockdowns`, { lockdowns });
	}
}
