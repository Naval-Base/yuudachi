import { Connection } from './Connection';
import { GraphQLRole } from './Role';

export interface GraphQLUser {
	data: {
		me: {
			username: string;
			role: GraphQLRole;
			connections: Connection[];
		}[];
	};
}
