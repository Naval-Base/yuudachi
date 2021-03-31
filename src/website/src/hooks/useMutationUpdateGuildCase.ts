import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import type { GraphQLGuildCase, GuildCasePayload } from '~/interfaces/GuildCases';

export function useMutationUpdateGuildCase(id: string, caseId: number) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildCase, unknown, GuildCasePayload>(
		(guildCase) =>
			fetchGraphQL(
				`mutation GuildCase($guild_id: String!, $case_id: Int!, $_set: cases_set_input!) {
					case: update_cases_by_pk(pk_columns: {guild_id: $guild_id, case_id: $case_id}, _set: $_set) {
						guild_id
						case_id
					}
				}`,
				{ guild_id: id, case_id: caseId, _set: { ...guildCase } },
			).then(({ body }) => body),
		{
			onSuccess: () => {
				void cache.invalidateQueries(['guilds', id, 'cases']);
			},
		},
	);
}
