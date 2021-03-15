import { RESTGetAPIUserResult } from 'discord-api-types';
import API from '..';

export default class Users {
	public constructor(private readonly api: API) {}

	public getUser(userId: `${bigint}`) {
		return this.api.make<RESTGetAPIUserResult>('get', `/users/${userId}`);
	}
}
