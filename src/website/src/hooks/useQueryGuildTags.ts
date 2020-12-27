import { useQuery } from 'react-query';
import { useCookie } from 'next-cookie';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildTags, GuildTag } from '~/interfaces/GuildTags';

export function useQueryGuildTags(
	id: string,
	orderBy: { [K in keyof GuildTag]?: 'asc' | 'desc' }[],
	limit: number,
	offset: number,
	loggedIn = false,
	props: any,
) {
	const cookie = useCookie(props.cookie);

	const { data, isLoading } = useQuery<GraphQLGuildTags>(
		['guilds', id, 'tags'],
		() =>
			fetchGraphQL(
				`query GuildTags($guild_id: String!, $order_by: [organizational_tags_order_by!], $limit: Int, $offset: Int) {
					tags: organizational_tags(where: {guild_id: {_eq: $guild_id}}, order_by: $order_by, limit: $limit, offset: $offset) {
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
				{ guild_id: id, order_by: orderBy, limit, offset },
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
		},
	);

	return { data: data?.data, isLoading };
}
