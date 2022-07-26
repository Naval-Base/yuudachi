import type { Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';

export enum SettingsKeys {
	ModLogChannelId = 'mod_log_channel_id',
	ModRoleId = 'mod_role_id',
	GuildLogWebhookId = 'guild_log_webhook_id',
	MemberLogWebhookId = 'member_log_webhook_id',
	Locale = 'locale',
	LogIgnoreChannels = 'log_ignore_channels',
	AutomodIgnoreRoles = 'automod_ignore_roles',
}

export async function getGuildSetting(guildId: Snowflake, prop: SettingsKeys, table = 'guild_settings') {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [data]: any = await sql.unsafe(
		`select ${prop} as value
		from ${table}
		where guild_id = $1`,
		[guildId],
	);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
	return data?.value ?? null;
}
