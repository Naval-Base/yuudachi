import { useMutation, useQueryCache } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildSettings } from '../interfaces/GuildSettings';

export function useMutationInsertGuildSettings(id: string, props: any) {
	const cookie = useCookie(props.cookie);
	const cache = useQueryCache();

	return useMutation<GraphQLGuildSettings>(
		() =>
			fetchGraphQL(
				`mutation Guild($guild_id: String!) {
					guild: insert_guild_settings_one(object: {guild_id: $guild_id}) {
						tag_role_id
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
					}
				}`,
				{ guild_id: id },
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			onSuccess: ({ data }) => {
				cache.setQueryData(['guilds', data.guild?.guild_id, 'settings'], { data });
			},
		},
	);
}
