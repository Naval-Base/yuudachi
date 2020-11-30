import { useQuery } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuild } from '../interfaces/Guild';

export function useQueryGuild(id: string, loggedIn = false, props: any) {
	const cookie = useCookie(props.cookie);

	const { data, isLoading } = useQuery<GraphQLGuild>(
		['guilds', 'bot', id],
		() =>
			fetchGraphQL(
				`query Guild($guild_id: String!) {
					guild: guild(guild_id: $guild_id) {
						id
						name
						icon
						owner
						features
						permissions
						permissions_new
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
