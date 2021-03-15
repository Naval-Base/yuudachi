import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box, Heading } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildSettings = dynamic(() => import('~/components/GuildSettings'));
const GuildModules = dynamic(() => import('~/components/GuildModules'));

import { useUserStore } from '~/store/index';

const GuildPage = () => {
	const user = useUserStore();
	const router = useRouter();

	useEffect(() => {
		if (user.loggedIn === false) {
			void router.push('/');
		}
	}, [user.loggedIn, router]);

	return (
		<GuildLayout>
			<Box my={{ base: 12 }} px={{ base: 50, xl: 150 }}>
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
