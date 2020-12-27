import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

export function useMutationInsertGuildSettings(id: string) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildSettings>(
		() =>
			fetchGraphQL(
				`mutation GuildSettings($guild_id: String!) {
					guild: insert_guild_settings_one(object: {guild_id: $guild_id}) {
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
			onSuccess: ({ data }) => {
				void cache.invalidateQueries(['guilds', data.guild?.guild_id, 'settings']);
			},
		},
	);
}
