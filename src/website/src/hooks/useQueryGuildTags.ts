import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLGuildTags, GuildTag } from '~/interfaces/GuildTags';
import type { SearchQuery } from '~/interfaces/SearchQuery';

export function useQueryGuildTags(
	id: string,
	orderBy: { [K in keyof GuildTag]?: 'asc' | 'desc' }[],
	limit: number,
	offset: number,
	search: SearchQuery | null = null,
) {
	const user = useUserStore();

	let where = { guild_id: { _eq: id } };
	if (search?.query) {
		where = { ...where, [search.key]: { [search.op]: search.query } };
	}

	const { data, isLoading } = useQuery<GraphQLGuildTags>(
		['guilds', id, 'tags', `?limit=${limit}&offset=${offset}${search ? `&search=${search.query as string}` : ''}`],
		() =>
			fetchGraphQL(
				`query GuildTags($where: organizational_tags_bool_exp!, $order_by: [organizational_tags_order_by!], $limit: Int, $offset: Int) {
					tagCount: organizational_tags_aggregate(where: $where) {
						aggregate {
							count
						}
					}
					
					tags: organizational_tags(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
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
				{ where, order_by: orderBy, limit, offset },
			).then(({ body }) => body),
		{
			enabled: Boolean(user.loggedIn),
			keepPreviousData: true,
		},
	);

	return { data: data?.data, isLoading };
}
