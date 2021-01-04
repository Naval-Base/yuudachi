import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLGuildCase } from '~/interfaces/GuildCases';

export function useQueryGuildCase(id: string, caseId: number, enabled = false) {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLGuildCase>(
		['guilds', id, 'cases', caseId],
		() =>
			fetchGraphQL(
				`query GuildCase($guild_id: String!, $case_id: Int!) {
					case: moderation_cases_by_pk(guild_id: $guild_id, case_id: $case_id) {
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
				{ guild_id: id, case_id: caseId },
			).then(({ body }) => body),
		{
			enabled: Boolean(user.loggedIn) && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
