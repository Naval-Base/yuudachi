import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLGuildChannels } from '~/interfaces/GuildChannel';

export function useQueryGuildChannels(id: string, enabled = false) {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLGuildChannels>(
		['guilds', id, 'channels'],
		() =>
			fetchGraphQL(
				`query GuildChannels($guild_id: String!) {
					channels: guild_channels(guild_id: $guild_id) {
						id
						name
						type
					}
				}`,
				{ guild_id: id },
			).then(({ body }) => body),
		{
			enabled: Boolean(user.loggedIn) && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
