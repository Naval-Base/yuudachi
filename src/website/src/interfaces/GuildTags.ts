export interface GuildTagPayload {
	name: string;
	aliases: string;
	content: string;
}

export interface GuildTag {
	aliases: string[];
	content: string;
	created_at: string;
	guild_id: string;
	hoisted: false;
	name: string;
	last_modified: string | null;
	templated: boolean;
	updated_at: string;
	user_id: string;
	uses: number;
}

export interface GraphQLGuildTags {
	data: {
		tags: GuildTag[];
	};
}

export interface GraphQLGuildTag {
	data: {
		tag: GuildTag;
	};
}
