import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildModerationSettings } from '~/interfaces/GuildSettings';

export function useMutationInsertGuildModerationSettings(id: string) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildModerationSettings>(
		() =>
			fetchGraphQL(
				`mutation GuildModerationSettings($guild_id: String!) {
					guild: insert_moderation_guild_settings_one(object: {guild_id: $guild_id}) {
						guild_id
					}
				}`,
				{ guild_id: id },
			).then(({ body }) => body),
		{
			onSuccess: ({ data }) => {
				void cache.invalidateQueries(['guilds', data.guild?.guild_id, 'settings', 'moderation']);
			},
		},
	);
}
