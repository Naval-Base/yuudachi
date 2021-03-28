import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import type { GraphQLGuildCases, GuildCase } from '~/interfaces/GuildCases';
import type { SearchQuery } from '~/interfaces/SearchQuery';

export function useQueryGuildCases(
	id: string,
	orderBy: { [K in keyof GuildCase]?: 'asc' | 'desc' }[],
	limit: number,
	offset: number,
	search: SearchQuery | null = null,
) {
	const user = useUserStore();

	let where = { guild_id: { _eq: id } };
	if (search?.query) {
		where = { ...where, [search.key]: { [search.op]: search.query } };
	}

	const { data, isLoading } = useQuery<GraphQLGuildCases>(
		['guilds', id, 'cases', `?limit=${limit}&offset=${offset}${search ? `&search=${search.query as string}` : ''}`],
		() =>
			fetchGraphQL(
				`query GuildCases($where: moderation_cases_bool_exp!, $order_by: [moderation_cases_order_by!], $limit: Int, $offset: Int) {
					caseCount: moderation_cases_aggregate(where: $where) {
						aggregate {
							count
						}
					}

					cases: moderation_cases(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
						action
						action_expiration
						action_processed
						case_id
						context_message_id
						created_at
						log_message_id
						mod_id
						mod_tag
						reason
						ref_id
						role_id
						target_id
						target_tag
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
