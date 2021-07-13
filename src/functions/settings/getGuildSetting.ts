import type { Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';

export enum SettingsKeys {
	ModLogChannelId = 'mod_log_channel_id',
	ModRoleId = 'mod_role_id',
}

export async function getGuildSetting(guildId: Snowflake, prop: SettingsKeys, table = 'guild_settings') {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [data]: any = await sql.unsafe(
		`select ${prop} as value
		from ${table}
		where guild_id = $1`,
		[guildId],
	);

	return data?.value ?? null;
}
