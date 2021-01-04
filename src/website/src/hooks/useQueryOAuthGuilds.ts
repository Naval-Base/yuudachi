import { useQuery, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLOAuthGuilds } from '~/interfaces/Guild';

export function useQueryOAuthGuilds() {
	const user = useUserStore();
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
			).then(({ body }) => body),
		{
			enabled: Boolean(user.loggedIn),
			onSuccess: (data) => {
				data.data.guilds.forEach((guild) => cache.setQueryData(['guilds', guild.id], guild));
			},
		},
	);

	return { data: data?.data, isLoading };
}
