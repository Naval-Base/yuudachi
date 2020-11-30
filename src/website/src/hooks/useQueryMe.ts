import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useCookie } from 'next-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { RootState } from '../store';
import { setUser } from '../store/slices/user';
import { GraphQLUser } from '../interfaces/User';

export function useQueryMe(props: any) {
	const cookie = useCookie(props.cookie);
	const user = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch();

	const { data, isLoading } = useQuery<GraphQLUser>(
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
					}
				}`,
				{},
				{ headers: { authorization: `Bearer ${cookie.get<string>('access_token')}` } },
			).then(({ response }) => response.json()),
		{
			enabled: !user.loggedIn,
		},
	);

	useEffect(() => {
		if (!user.loggedIn && data?.data.me[0] && data.data.me[0].connections.length) {
			const connection = data.data.me[0].connections.find((c) => c.main)!;
			dispatch(
				setUser({
					loggedIn: true,
					id: connection.id,
					username: data.data.me[0].username,
					avatar: connection.avatar,
				}),
			);
		}
	});

	return { data: data?.data, isLoading };
}
