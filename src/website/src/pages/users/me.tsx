import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Grid, Img, Text, Heading } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

const Guilds = dynamic(() => import('~/components/Guilds'));

import { RootState } from '~/store/index';

const UserPage = () => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();

	useEffect(() => {
		if (!user.loggedIn) {
			void router.push('/');
		}
	}, [user.loggedIn, router]);

	const UserDisplay = () =>
		user.loggedIn ? (
			<>
				<Img rounded="full" boxSize="100px" src={user.avatar} alt={user.username} />
				<Heading>{user.username}</Heading>
			</>
		) : (
			<></>
		);

	return (
		<>
			<Grid
				templateColumns={{ base: 'auto', md: '150px' }}
				gap={{ base: '32px', md: '8px' }}
				autoFlow="column"
				justifyItems="center"
				justifyContent="center"
				alignItems="center"
				my={{ base: 12 }}
				px={{ base: 0, md: 200 }}
			>
				<UserDisplay />
			</Grid>

			<Box mt={{ base: 12, lg: 24 }} mb={{ base: 12 }} px={{ base: 0, md: 200 }}>
				<Box px={8} pb={8}>
					<Heading size="lg">Manage</Heading>
					<Text>Severs you can manage</Text>
				</Box>
				<Guilds />
			</Box>
		</>
	);
};

export default UserPage;
