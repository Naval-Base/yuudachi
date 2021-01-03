import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { useUserStore } from '~/store/index';

import { GraphQLMe } from '~/interfaces/User';

export const queryMe = (cookie?: string) =>
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
		{},
		cookie,
	).then(({ body }) => body);

export function useQueryMe() {
	const user = useUserStore();

	const { data, isLoading } = useQuery<GraphQLMe & { errors: unknown[] }>('user', () => queryMe());

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
	}, [user.loggedIn, user, data?.data?.me, data?.errors]);

	return { data: data?.data, isLoading };
}
