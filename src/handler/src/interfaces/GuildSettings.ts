export interface GuildSettings {
	guild_id: `${bigint}`;
	prefix: string;
	mod_log_channel_id: `${bigint}`;
	mod_role_id: `${bigint}`;
	guild_log_channel_id: `${bigint}`;
	member_log_channel_id: `${bigint}`;
	mute_role_id: `${bigint}`;
	tag_role_id: `${bigint}`;
	embed_role_id: `${bigint}`;
	reaction_role_id: `${bigint}`;
	locale: string;
	modules: number;
	repository_aliases: string[];
}
