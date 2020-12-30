import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLGuildTag, GuildTagPayload } from '~/interfaces/GuildTags';

export function useMutationInsertGuildTag(id: string) {
	const user = useUserStore();
	const cache = useQueryClient();

	return useMutation<GraphQLGuildTag, unknown, GuildTagPayload>(
		(guildTag) =>
			fetchGraphQL(
				`mutation GuildTag($object: organizational_tags_insert_input!) {
					tag: insert_organizational_tags_one(object: $object) {
						guild_id
						name
					}
				}`,
				{ object: { ...guildTag, guild_id: id, user_id: user.id, last_modified: user.id } },
			).then(({ body }) => body),
		{
			onSuccess: () => {
				void cache.invalidateQueries(['guilds', id, 'tags']);
			},
		},
	);
}
