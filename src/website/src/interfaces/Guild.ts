import { RESTAPIPartialCurrentUserGuild, RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v6';

export interface GraphQLOAuthGuilds {
	data: {
		guilds: RESTGetAPICurrentUserGuildsResult;
	};
}

export interface GraphQLGuild {
	data: {
		guild: RESTAPIPartialCurrentUserGuild | null;
	};
}
