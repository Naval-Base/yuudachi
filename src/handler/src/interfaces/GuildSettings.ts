export interface GuildSettings {
	guild_id: string;
	prefix: string;
	mod_log_channel_id: string;
	mod_role_id: string;
	guild_log_channel_id: string;
	member_log_channel_id: string;
	mute_role_id: string;
	tag_role_id: string;
	embed_role_id: string;
	reaction_role_id: string;
	locale: string;
	modules: number;
	repository_aliases: string[];
}
