import type { RESTGetAPICurrentUserGuildsResult, RESTGetAPIGuildResult } from 'discord-api-types/v8';

export interface GraphQLOAuthGuilds {
	data: {
		guilds: RESTGetAPICurrentUserGuildsResult;
	};
}

export interface GraphQLGuild {
	data: {
		guild: RESTGetAPIGuildResult | null;
	};
}
