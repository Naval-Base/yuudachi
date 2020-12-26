import { useQuery, useQueryClient } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLOAuthGuilds } from '~/interfaces/Guild';

export function useQueryOAuthGuilds(loggedIn = false, props: any) {
	const cookie = useCookie(props.cookie);
	const cache = useQueryClient();

	const { data, isLoading } = useQuery<GraphQLOAuthGuilds>(
		'guilds',
		() =>
			fetchGraphQL(
				`query Guilds {
					guilds: guilds_oauth {
						id
						name
						icon
						owner
						features
						permissions
						permissions_new
					}
				}`,
				{},
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
			onSuccess: (data) => {
				data.data.guilds.forEach((guild) => cache.setQueryData(['guilds', guild.id], guild));
			},
		},
	);

	return { data: data?.data, isLoading };
}
