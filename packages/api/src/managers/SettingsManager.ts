import { injectable, inject } from 'tsyringe';
import { kSQL } from '../tokens';
import { SQL } from 'postgres';

export enum SettingsKeys {
	MOD_LOG_CHANNEL_ID = 'mod_log_channel_id',
}

@injectable()
export default class SettingsManager {
	public constructor(
		@inject(kSQL)
		public sql: SQL,
	) {}

	public async get(guildId: string, prop: string): Promise<string | null> {
		const [data]: any = await this.sql`
			select value
			from guild_settings
			where guild_id = ${guildId}
				and key = ${prop}`;

		return data?.value ?? null;
	}
}
