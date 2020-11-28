import { useQuery, useQueryCache } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { Guilds } from '../interfaces/Guilds';

export function useQueryGuilds(loggedIn = false, props: any) {
	const cookie = useCookie(props.cookie);
	const cache = useQueryCache();

	const { data, isLoading } = useQuery<Guilds>(
		'guilds',
		() =>
			fetchGraphQL(
				`query Guilds {
					guilds: oauth_guilds {
						features
						icon
						id
						name
						owner
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
