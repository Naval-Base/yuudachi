import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

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
						mod_role_id
						mod_log_channel_id
						member_log_channel_id
						mute_role_id
						embed_role_id
						emoji_role_id
						reaction_role_id
						tag_role_id
						locale
						modules
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
