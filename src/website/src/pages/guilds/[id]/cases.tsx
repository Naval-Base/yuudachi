import { useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildCases = dynamic(() => import('~/components/GuildCases'));

import { initializeUserStore, useUserStore } from '~/store/index';

import { queryMe } from '~/hooks/useQueryMe';

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const userStore = initializeUserStore();
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
}

const GuildCasesPage = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (!user.loggedIn) {
			void router.push('/');
		}
	}, [user.loggedIn, router]);

	return (
		<GuildLayout>
			<Box mt={10} px={{ base: 5 }}>
				<GuildCases />
			</Box>
		</GuildLayout>
	);
};

export default GuildCasesPage;
