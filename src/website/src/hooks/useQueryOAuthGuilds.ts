import { useQuery, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLOAuthGuilds } from '~/interfaces/Guild';

export function useQueryOAuthGuilds(loggedIn = false) {
	const cache = useQueryClient();

	const { data, isLoading } = useQuery<GraphQLOAuthGuilds>(
		'guilds',
		() =>
			fetchGraphQL(
				`query OAuthGuilds {
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
