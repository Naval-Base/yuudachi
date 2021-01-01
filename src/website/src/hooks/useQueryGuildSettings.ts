import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

export function useQueryGuildSettings(id: string, enabled = false) {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLGuildSettings>(
		['guilds', id, 'settings'],
		() =>
			fetchGraphQL(
				`query GuildSettings($guild_id: String!) {
					guild: guild_settings_by_pk(guild_id: $guild_id) {
						guild_id
						prefix
						locale
						modules
						repository_aliases
					}
				}`,
				{ guild_id: id },
			).then(({ body }) => body),
		{
			enabled: user.loggedIn && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
