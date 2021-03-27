import { injectable, inject } from 'tsyringe';
import type { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';

const { kSQL } = Tokens;

export enum SettingsKeys {
	PREFIX = 'prefix',
	MOD_LOG_CHANNEL_ID = 'mod_log_channel_id',
	MOD_ROLE_ID = 'mod_role_id',
}

@injectable()
export default class SettingsManager {
	public constructor(
		@inject(kSQL)
		public sql: Sql<any>,
	) {}

	/**
	 * Get a setting for a guild. NEVER PASS UNSANITIZED USER INPUT INTO `prop`: IT IS NOT SQL ESCAPED.
	 * @param guildId The guild ID for which to get settings
	 * @param prop The settings key to fetch
	 */
	public async get(guildId: string, prop: string, table = 'guild_settings'): Promise<string | null> {
		const [data]: any = await this.sql.unsafe(
			`select ${prop} as value
			from ${table}
			where guild_id = $1`,
			[guildId],
		);

		return data?.value ?? null;
	}
}
