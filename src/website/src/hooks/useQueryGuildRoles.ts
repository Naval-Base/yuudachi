import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLGuildRoles } from '~/interfaces/GuildRole';

export function useQueryGuildRoles(id: string, enabled = false) {
	const user = useUserStore();

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
			).then(({ body }) => body),
		{
			enabled: Boolean(user.loggedIn) && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
