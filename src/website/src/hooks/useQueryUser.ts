import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLUser } from '~/interfaces/User';

export function useQueryUser(userId: string, enabled = false) {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLUser>(
		['user', userId, 'info'],
		() =>
			fetchGraphQL(
				`query User($user_id: String!) {
					user(user_id: $user_id) {
						username
						discriminator
					}
				}`,
				{ user_id: userId },
			).then(({ body }) => body),
		{
			enabled: !Boolean(user.loggedIn) && enabled,
		},
	);

	return { data: data?.data, isLoading };
}
