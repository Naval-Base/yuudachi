import { Connection } from './Connection';
import { GraphQLRole } from './Role';

export interface GraphQLMe {
	data: {
		me: {
			username: string;
			role: GraphQLRole;
			connections: Connection[];
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
