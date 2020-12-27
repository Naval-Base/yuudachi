import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildTag } from '~/interfaces/GuildTags';

export function useQueryGuildTag(id: string, name: string, loggedIn = false) {
	const { data, isLoading } = useQuery<GraphQLGuildTag>(
		['guilds', id, 'tags', name],
		() =>
			fetchGraphQL(
				`query GuildTag($guild_id: String!, $name: String!) {
					tag: organizational_tags_by_pk(guild_id: $guild_id, name: $name) {
						aliases
						content
						created_at
						hoisted
						name
						last_modified
						templated
						updated_at
						user_id
						uses
					}
				}`,
				{ guild_id: id, name: name },
			).then(({ body }) => body),
		{
			enabled: loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
