import { APIUser } from 'discord-api-types';
import API from '..';

export default class Users {
	public constructor(private readonly api: API) {}

	public get(userId: `${bigint}`) {
		return this.api.make<APIUser>('get', `/users/${userId}`);
	}
}
