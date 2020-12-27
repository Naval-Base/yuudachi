import { useMutation, useQueryClient } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildTag, GuildTagPayload } from '~/interfaces/GuildTags';

export function useMutationUpdateGuildTag(id: string, name: string, props: any) {
	const cookie = useCookie(props.cookie);
	const cache = useQueryClient();

	return useMutation<GraphQLGuildTag, unknown, GuildTagPayload>(
		(guildTag) =>
			fetchGraphQL(
				`mutation GuildTag($guild_id: String!, $name: String!, $_set: organizational_tags_set_input!) {
					tag: update_organizational_tags_by_pk(pk_columns: {guild_id: $guild_id, name: $name}, _set: $_set) {
						aliases
						content
						created_at
						guild_id
						hoisted
						last_modified
						name
						templated
						updated_at
						user_id
						uses
					}
				}`,
				{ guild_id: id, name, _set: guildTag },
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			onSuccess: ({ data }) => {
				cache.setQueryData(['guilds', data.tag?.guild_id, 'tags', data.tag?.name], { data });
			},
		},
	);
}
