import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import type { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

export function useMutationDeleteGuildTag(id: string, name: string) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildSettings>(
		() =>
			fetchGraphQL(
				`mutation GuildTag($guild_id: String!, $name: String!) {
					delete_organizational_tags_by_pk(guild_id: $guild_id, name: $name) {
						guild_id
						name
					}
				}`,
				{ guild_id: id, name },
			).then(({ body }) => body),
		{
			onSuccess: () => {
				void cache.invalidateQueries(['guilds', id, 'tags']);
			},
		},
	);
}
