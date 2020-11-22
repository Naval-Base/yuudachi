import { CreateCase } from '@yuudachi/types';
import API from '..';

export default class Guilds {
	public constructor(private readonly api: API) {}

	public createCase(userId: string, guildId: string, ...cases: CreateCase[]) {
		return this.api.make(userId, 'post', `/guilds/${guildId}/cases`, { cases });
	}
}
