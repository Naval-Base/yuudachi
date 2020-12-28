import { useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { RootState } from '~/store/index';

import { GraphQLOAuthGuilds } from '~/interfaces/Guild';

export function useQueryOAuthGuilds() {
	const user = useSelector((state: RootState) => state.user);
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
			enabled: user.loggedIn,
			onSuccess: (data) => {
				data.data.guilds.forEach((guild) => cache.setQueryData(['guilds', guild.id], guild));
			},
		},
	);

	return { data: data?.data, isLoading };
}
