import { injectable, inject } from 'tsyringe';
import { Sql } from 'postgres';

import { kSQL } from '../tokens';

export enum SettingsKeys {
	PREFIX = 'prefix',
	MOD_LOG_CHANNEL_ID = 'mod_log_channel_id',
}

@injectable()
export default class SettingsManager {
	public constructor(
		@inject(kSQL)
		public sql: Sql<any>,
	) {}

	public async get(guildId: string, prop: string): Promise<string | null> {
		const [data]: any = await this.sql.unsafe(
			`select ${prop} as value
			from guild_settings
			where guild_id = $1`,
			[guildId],
		);
		console.log(data);

		return data?.value ?? null;
	}
}
