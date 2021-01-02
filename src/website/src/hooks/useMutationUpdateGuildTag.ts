import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLGuildTag, GuildTagPayload } from '~/interfaces/GuildTags';

export function useMutationUpdateGuildTag(id: string, name: string) {
	const user = useUserStore();
	const cache = useQueryClient();

	return useMutation<GraphQLGuildTag, unknown, GuildTagPayload>(
		(guildTag) =>
			fetchGraphQL(
				`mutation GuildTag($guild_id: String!, $name: String!, $_set: organizational_tags_set_input!) {
					tag: update_organizational_tags_by_pk(pk_columns: {guild_id: $guild_id, name: $name}, _set: $_set) {
						guild_id
						name
					}
				}`,
				{ guild_id: id, name, _set: { ...guildTag, last_modified: user.id } },
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
