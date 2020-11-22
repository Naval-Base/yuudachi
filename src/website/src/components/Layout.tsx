import { Grid, Box } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { useEffect } from 'react';
import fetch from '../util/fetch';

import { RootState } from '../store';
import Navbar from '../components/Navbar';
import { setUser } from '../store/slices/user';

interface Connection {
	main: boolean;
	id: string;
	avatar: string;
}

interface DiscordUser {
	username: string;
}

const Layout = ({ children }: any) => {
	const user = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch();

	const { data } = useQuery<{ user: DiscordUser; connections: Connection[] }>(
		'user',
		() =>
			fetch('http://localhost:3500/api/users/me', { credentials: 'include' }).then(({ response }) => response.json()),
		{
			enabled: !user.loggedIn,
		},
	);

	useEffect(() => {
		if (!user.loggedIn && data?.user && data.connections.length) {
			const connection = data.connections.find((c) => c.main)!;
			dispatch(setUser({ loggedIn: true, id: connection.id, username: data.user.username, avatar: connection.avatar }));
		}
	});

	return (
		<Grid templateRows="auto 1fr auto" h="100%">
			<Navbar />
			<Box w="100%" h="100%">
				{children}
			</Box>
			<Box w="100%" h="100%">
				Footer
			</Box>
		</Grid>
	);
};

export default Layout;
