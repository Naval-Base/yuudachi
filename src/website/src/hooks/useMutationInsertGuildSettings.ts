import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import type { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

export function useMutationInsertGuildSettings(id: string) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildSettings>(
		() =>
			fetchGraphQL(
				`mutation GuildSettings($guild_id: String!) {
					guild: insert_guild_settings_one(object: {guild_id: $guild_id}) {
						guild_id
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
