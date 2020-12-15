import { useMutation, useQueryClient } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GuildSetingsPayload, GraphQLGuildSettings } from '../interfaces/GuildSettings';

export function useMutationUpdateGuildSettings(id: string, props: any) {
	const cookie = useCookie(props.cookie);
	const cache = useQueryClient();

	return useMutation<GraphQLGuildSettings, unknown, GuildSetingsPayload>(
		(guildSettings) =>
			fetchGraphQL(
				`mutation Guild($guild_id: String!, $_set: guild_settings_set_input) {
					guild: update_guild_settings_by_pk(pk_columns: {guild_id: $guild_id}, _set: $_set) {
						tag_role_id
						role_state
						repository_aliases
						reaction_role_id
						prefix
						mute_role_id
						moderation
						mod_role_id
						mod_log_channel_id
						member_log_channel_id
						locale
						guild_log_channel_id
						emoji_role_id
						embed_role_id
						guild_id
					}
				}`,
				{ guild_id: id, _set: guildSettings },
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			onSuccess: ({ data }) => {
				cache.setQueryData(['guilds', data.guild?.guild_id, 'settings'], { data });
			},
		},
	);
}
