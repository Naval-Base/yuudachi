import { useQuery } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GuildSettings } from '../interfaces/GuildSettings';

export function useQueryGuildSettings(id: string, loggedIn = false, props: any) {
	const cookie = useCookie(props.cookie);

	const { data, isLoading } = useQuery<GuildSettings>(
		['guilds', id, 'settings'],
		() =>
			fetchGraphQL(
				`query Guild($guild_id: String!) {
					guild: guild_settings_by_pk(guild_id: $guild_id) {
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
						guild_id
						emoji_role_id
						embed_role_id
					}
				}`,
				{ guild_id: id },
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
