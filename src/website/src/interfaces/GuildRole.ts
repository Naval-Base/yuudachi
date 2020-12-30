import { APIRole } from 'discord-api-types/v8';

export interface GraphQLGuildRoles {
	data: {
		roles: APIRole[] | null;
	};
}
