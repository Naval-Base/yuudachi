import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLGuildModerationSettings } from '~/interfaces/GuildSettings';

export function useQueryGuildModerationSettings(id: string, enabled = false) {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLGuildModerationSettings>(
		['guilds', id, 'settings', 'moderation'],
		() =>
			fetchGraphQL(
				`query GuildModerationSettings($guild_id: String!) {
					guild: moderation_guild_settings_by_pk(guild_id: $guild_id) {
						guild_id
						mod_role_id
						mod_log_channel_id
						member_log_channel_id
						mute_role_id
						embed_role_id
						emoji_role_id
						reaction_role_id
						tag_role_id
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
