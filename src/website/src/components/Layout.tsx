import { Grid, Box } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from 'react-query';
import { fetch } from '../util/fetch';

import { RootState } from '../store';
import Navbar from '../components/Navbar';
import { setUser } from '../store/slices/user';
import { useEffect } from 'react';

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
		'userData',
		() =>
			fetch('http://localhost:3500/api/users/me', { credentials: 'include' }).then(({ response }) => response.json()),
		{ enabled: !user.loggedIn, refetchOnWindowFocus: false },
	);

	useEffect(() => {
		const connection = data?.connections.find((c: any) => c.main);
		if (!user.loggedIn && data?.user) {
			dispatch(
				setUser({ loggedIn: true, id: connection!.id, username: data.user.username, avatar: connection!.avatar }),
			);
		}
	});

	return (
		<Grid templateRows="auto 1fr auto" h="100%">
			<Navbar />
			<Box w="100%" h="100%" bg="gray.900">
				{children}
			</Box>
			<Box w="100%" h="100%" bg="gray.800">
				<Box color="white">Footer</Box>
			</Box>
		</Grid>
	);
};

export default Layout;
