import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { RootState } from '~/store/index';

import { GraphQLGuildRoles } from '~/interfaces/GuildRole';

export function useQueryGuildRoles(id: string, enabled = false) {
	const user = useSelector((state: RootState) => state.user);

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
			enabled: user.loggedIn && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
