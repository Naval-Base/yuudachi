import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLGuildTag } from '~/interfaces/GuildTags';

export function useQueryGuildTag(id: string, name: string, enabled = false) {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLGuildTag>(
		['guilds', id, 'tags', name],
		() =>
			fetchGraphQL(
				`query GuildTag($guild_id: String!, $name: String!) {
					tag: organizational_tags_by_pk(guild_id: $guild_id, name: $name) {
						aliases
						content
						created_at
						name
						last_modified
						updated_at
						user_id
						uses
					}
				}`,
				{ guild_id: id, name: name },
			).then(({ body }) => body),
		{
			enabled: Boolean(user.loggedIn) && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
