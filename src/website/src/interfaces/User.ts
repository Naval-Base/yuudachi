import type { Connection } from './Connection';

export interface GraphQLMe {
	data: {
		me: {
			username: string;
			connections: Connection[];
			guild_moderators: { guild_id: string; manage: boolean }[];
		}[];
	};
}

export interface GraphQLUser {
	data: {
		user: {
			username: string;
			discriminator: string;
		};
	};
}
