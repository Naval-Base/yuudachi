import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLGuildTag, GuildTagPayload } from '~/interfaces/GuildTags';

export function useMutationInsertGuildTag(id: string) {
	const user = useUserStore();
	const cache = useQueryClient();

	return useMutation<GraphQLGuildTag, unknown, GuildTagPayload>(
		(guildTag) =>
			fetchGraphQL(
				`mutation GuildTag($object: tags_insert_input!) {
					tag: insert_tags_one(object: $object) {
						guild_id
						name
					}
				}`,
				{ object: { ...guildTag, guild_id: id, user_id: user.id, last_modified: user.id } },
			).then(({ body }) => {
				if (body.errors) {
					if (body.errors?.[0]?.extensions?.code === 'constraint-violation') {
						throw new Error('A tag with this name already exists.');
					}
					throw new Error(body.errors?.[0]?.message);
				}

				return body;
			}),
		{
			onSuccess: () => {
				void cache.invalidateQueries(['guilds', id, 'tags']);
			},
		},
	);
}
