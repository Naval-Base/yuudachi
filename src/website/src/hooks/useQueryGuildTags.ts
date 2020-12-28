import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { RootState } from '~/store/index';

import { GraphQLGuildTags, GuildTag } from '~/interfaces/GuildTags';

export function useQueryGuildTags(
	id: string,
	orderBy: { [K in keyof GuildTag]?: 'asc' | 'desc' }[],
	limit: number,
	offset: number,
) {
	const user = useSelector((state: RootState) => state.user);

	const { data, isLoading } = useQuery<GraphQLGuildTags>(
		['guilds', id, 'tags', `?limit=${limit}&offset=${offset}`],
		() =>
			fetchGraphQL(
				`query GuildTags($guild_id: String!, $order_by: [organizational_tags_order_by!], $limit: Int, $offset: Int) {
					tagCount: organizational_tags_aggregate(where: {guild_id: {_eq: $guild_id}}) {
						aggregate {
							count
						}
					}
					
					tags: organizational_tags(where: {guild_id: {_eq: $guild_id}}, order_by: $order_by, limit: $limit, offset: $offset) {
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
				{ guild_id: id, order_by: orderBy, limit, offset },
			).then(({ body }) => body),
		{
			enabled: user.loggedIn,
			keepPreviousData: true,
		},
	);

	return { data: data?.data, isLoading };
}
