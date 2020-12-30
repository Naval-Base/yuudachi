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
						tag_role_id
						repository_aliases
						reaction_role_id
						prefix
						mute_role_id
						mod_role_id
						mod_log_channel_id
						member_log_channel_id
						locale
						guild_log_channel_id
						emoji_role_id
						embed_role_id
						guild_id
						modules
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
