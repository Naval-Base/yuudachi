import { APIRole } from 'discord-api-types';

export interface GraphQLGuildRoles {
	data: {
		roles: APIRole[] | null;
	};
}
