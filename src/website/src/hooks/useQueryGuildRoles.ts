import { useQuery } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildRoles } from '~/interfaces/GuildRole';

export function useQueryGuildRoles(id: string, loggedIn = false, props: any) {
	const cookie = useCookie(props.cookie);

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
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
