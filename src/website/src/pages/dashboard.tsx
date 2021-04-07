import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Grid, Img, Text, Heading } from '@chakra-ui/react';

import Layout from '~/components/Layout';

const MotionBox = dynamic(() => import('~/components/MotionBox'));
const Guilds = dynamic(() => import('~/components/Guilds'));

import { useUserStore } from '~/store/index';

const Dashboard = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (user.loggedIn === false) {
			void router.push('/');
		}
	}, [user.loggedIn, router]);

	const UserDisplay = () =>
		user.loggedIn ? (
			<>
				<MotionBox
					whileHover={{ scale: 1.05, rotate: 360 }}
					transition={{ type: 'spring', stiffness: 200, damping: 25 }}
				>
					<Img rounded="full" boxSize="100px" src={user.avatar ?? ''} alt={user.username!} />
				</MotionBox>

				<Heading>{user.username}</Heading>
			</>
		) : null;

	return (
		<Layout>
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
		</Layout>
	);
};

export default Dashboard;
