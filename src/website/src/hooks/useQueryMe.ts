import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLUser } from '~/interfaces/User';

export function useQueryMe() {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLUser & { errors: unknown[] }>(
		'user',
		() =>
			fetchGraphQL(
				`query Me {
					me: users {
						connections {
							id
							avatar
							main
						}
						username
						role
					}
				}`,
				{},
			).then(({ body }) => body),
		{
			enabled: !user.loggedIn,
		},
	);

	useEffect(() => {
		if (data?.errors) {
			return;
		}

		if (!user.loggedIn && data?.data?.me[0] && data.data?.me[0].connections.length) {
			const connection = data.data.me[0].connections.find((c) => c.main)!;
			user.setUser({
				loggedIn: true,
				id: connection.id,
				role: data.data.me[0].role,
				username: data.data.me[0].username,
				avatar: connection.avatar,
			});
		}
	}, [user, data?.data?.me, data?.errors]);

	return { data: data?.data, isLoading };
}
