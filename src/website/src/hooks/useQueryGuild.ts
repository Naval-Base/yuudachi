import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { RootState } from '~/store/index';

import { GraphQLGuild } from '~/interfaces/Guild';

export function useQueryGuild(id: string) {
	const user = useSelector((state: RootState) => state.user);

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
					}
				}`,
				{ guild_id: id },
			).then(({ body }) => body),
		{
			enabled: user.loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
