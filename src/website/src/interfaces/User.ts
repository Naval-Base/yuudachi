import { Connection } from './Connection';

export interface User {
	data: {
		me: {
			user: {
				username: string;
				connections: Connection[];
			};
		};
	};
}
