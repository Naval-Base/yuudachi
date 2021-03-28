import type { RESTGetAPIUserResult, Snowflake } from 'discord-api-types';
import API from '..';

export default class Users {
	public constructor(private readonly api: API) {}

	public getUser(userId: Snowflake) {
		return this.api.make<RESTGetAPIUserResult>('get', `/users/${userId}`);
	}
}
