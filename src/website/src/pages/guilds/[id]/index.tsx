import { useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Heading } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildSettings = dynamic(() => import('~/components/GuildSettings'));
const GuildModules = dynamic(() => import('~/components/GuildModules'));

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

const GuildPage = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (!user.loggedIn) {
			void router.push('/');
		}
	}, [user.loggedIn, router]);

	return (
		<GuildLayout>
			<Box mt={10} px={{ base: 50, sm: 100, md: 150, lg: 200, xl: 250 }}>
				<Heading mb={8} size="md">
					Guild Settings
				</Heading>
				<GuildSettings />
				<Heading my={8} size="md">
					Guild Modules
				</Heading>
				<GuildModules />
			</Box>
		</GuildLayout>
	);
};

export default GuildPage;
