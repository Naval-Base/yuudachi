import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { RootState } from '~/store/index';

import { GraphQLGuildCases, GuildCase } from '~/interfaces/Cases';

export function useQueryGuildCases(
	id: string,
	orderBy: { [K in keyof GuildCase]?: 'asc' | 'desc' }[],
	limit: number,
	offset: number,
) {
	const user = useSelector((state: RootState) => state.user);

	const { data, isLoading } = useQuery<GraphQLGuildCases>(
		['guilds', id, 'cases', `?limit=${limit}&offset=${offset}`],
		() =>
			fetchGraphQL(
				`query GuildCases($guild_id: String!, $order_by: [moderation_cases_order_by!], $limit: Int, $offset: Int) {
					caseCount: moderation_cases_aggregate(where: {guild_id: {_eq: $guild_id}}) {
						aggregate {
							count
						}
					}

					cases: moderation_cases(where: {guild_id: {_eq: $guild_id}}, order_by: $order_by, limit: $limit, offset: $offset) {
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
				{ guild_id: id, order_by: orderBy, limit, offset },
			).then(({ body }) => body),
		{
			enabled: user.loggedIn,
			keepPreviousData: true,
		},
	);

	return { data: data?.data, isLoading };
}
