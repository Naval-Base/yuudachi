import { Connection } from './Connection';

export interface GraphQLUser {
	data: {
		me: {
			username: string;
			connections: Connection[];
		}[];
	};
}
