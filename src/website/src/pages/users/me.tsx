import { useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Grid, Img, Text, Heading } from '@chakra-ui/react';

const Guilds = dynamic(() => import('~/components/Guilds'));

import { initializeUserStore, useUserStore } from '~/store/index';

import { queryMe } from '~/hooks/useQueryMe';

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const userStore = initializeUserStore();

	try {
		const res = await queryMe(context.req.headers.cookie);

		if (res.data?.me[0] && res.data?.me[0].connections.length) {
			const connection = res.data.me[0].connections.find((c: { main: boolean }) => c.main)!;
			userStore.getState().setUser({
				loggedIn: true,
				id: connection.id,
				role: res.data.me[0].role,
				username: res.data.me[0].username,
				avatar: connection.avatar,
			});
		}

		return {
			props: { initialStoreState: JSON.stringify(userStore.getState()) },
		};
	} catch {
		return {
			redirect: {
				destination: '/',
				permanent: true,
			},
		};
	}
}

const UserPage = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (!user.loggedIn) {
			void router.push('/');
		}
	}, [user.loggedIn, router]);

	const UserDisplay = () =>
		user.loggedIn ? (
			<>
				<Img rounded="full" boxSize="100px" src={user.avatar ?? ''} alt={user.username!} />
				<Heading>{user.username}</Heading>
			</>
		) : null;

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
