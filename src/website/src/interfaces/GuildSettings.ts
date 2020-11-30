export interface GuildSetingsPayload {
	prefix: string;
	moderation: boolean;
	mod_role_id: string | null;
	mod_log_channel_id: string | null;
	guild_log_channel_id: string | null;
	member_log_channel_id: string | null;
	mute_role_id: string | null;
	tag_role_id: string | null;
	embed_role_id: string | null;
	emoji_role_id: string | null;
	reaction_role_id: string | null;
	role_state: boolean;
}

export interface GuildSettings {
	guild_id: string;
	prefix: string;
	moderation: boolean;
	mod_role_id: string | null;
	mod_log_channel_id: string | null;
	guild_log_channel_id: string | null;
	member_log_channel_id: string | null;
	mute_role_id: string | null;
	tag_role_id: string | null;
	embed_role_id: string | null;
	emoji_role_id: string | null;
	reaction_role_id: string | null;
	role_state: boolean;
	repository_aliases: string[] | null;
	locale: string;
	[key: string]: string | string[] | boolean | null;
}

export interface GraphQLGuildSettings {
	data: {
		guild: GuildSettings | null;
	};
}
