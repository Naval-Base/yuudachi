import { RESTAPIPartialCurrentUserGuild, RESTGetAPICurrentUserGuildsResult } from 'discord-api-types';

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
