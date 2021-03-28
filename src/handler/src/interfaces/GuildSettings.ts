import type { Snowflake } from 'discord-api-types/v8';

export interface GuildSettings {
	guild_id: Snowflake;
	prefix: string;
	mod_log_channel_id: Snowflake;
	mod_role_id: Snowflake;
	guild_log_channel_id: Snowflake;
	member_log_channel_id: Snowflake;
	mute_role_id: Snowflake;
	tag_role_id: Snowflake;
	embed_role_id: Snowflake;
	reaction_role_id: Snowflake;
	locale: string;
	modules: number;
	repository_aliases: string[];
}
