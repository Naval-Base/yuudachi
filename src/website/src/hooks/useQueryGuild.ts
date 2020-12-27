import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuild } from '~/interfaces/Guild';

export function useQueryGuild(id: string, loggedIn = false) {
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
			).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
