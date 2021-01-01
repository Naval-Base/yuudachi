import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Heading } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildSettings = dynamic(() => import('~/components/GuildSettings'));

import { useUserStore } from '~/store/index';

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
			</Box>
		</GuildLayout>
	);
};

export default GuildPage;
