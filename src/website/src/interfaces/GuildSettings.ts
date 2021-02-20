export interface GuildSettingsPayload {
	prefix: string;
}

export interface GuildModulesPayload {
	modules: number;
}

export interface GuildModerationSettingsPayload {
	mod_role_id: string | null;
	mod_log_channel_id: string | null;
	guild_log_channel_id: string | null;
	member_log_channel_id: string | null;
	mute_role_id: string | null;
	tag_role_id: string | null;
	embed_role_id: string | null;
	emoji_role_id: string | null;
	reaction_role_id: string | null;
}

export interface GuildSettings {
	guild_id: string;
	prefix: string;
	mod_role_id: string | null;
	mod_log_channel_id: string | null;
	guild_log_channel_id: string | null;
	member_log_channel_id: string | null;
	mute_role_id: string | null;
	tag_role_id: string | null;
	embed_role_id: string | null;
	emoji_role_id: string | null;
	reaction_role_id: string | null;
	locale: string;
	modules: number;
	repository_aliases: string[] | null;
	[key: string]: string | number | string[] | null;
}

export interface GraphQLGuildSettings {
	data: {
		guild: GuildSettings | null;
	};
}
