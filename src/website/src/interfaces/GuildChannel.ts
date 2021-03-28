import type { APIChannel } from 'discord-api-types/v8';

export interface GraphQLGuildChannels {
	data: {
		channels: APIChannel[] | null;
	};
}
