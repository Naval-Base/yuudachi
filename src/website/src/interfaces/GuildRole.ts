import { APIRole } from 'discord-api-types/v6';

export interface GraphQLGuildRoles {
	data: {
		roles: APIRole[] | null;
	};
}
