import { Connection } from './Connection';

export interface GraphQLMe {
	data: {
		me: {
			username: string;
			connections: Connection[];
			guild_moderators: string[];
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
