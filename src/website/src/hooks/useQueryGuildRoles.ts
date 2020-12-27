import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildRoles } from '~/interfaces/GuildRole';

export function useQueryGuildRoles(id: string, loggedIn = false) {
	const { data, isLoading } = useQuery<GraphQLGuildRoles>(
		['guilds', id, 'roles'],
		() =>
			fetchGraphQL(
				`query GuildRoles($guild_id: String!) {
					roles: guild_roles(guild_id: $guild_id) {
						id
						name
						color
					}
				}`,
				{ guild_id: id },
			).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
