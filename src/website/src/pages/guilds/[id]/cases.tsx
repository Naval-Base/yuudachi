import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildCases = dynamic(() => import('~/components/GuildCases'));

import { useUserStore } from '~/store/index';

const GuildCasesPage = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (user.loggedIn === false) {
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
