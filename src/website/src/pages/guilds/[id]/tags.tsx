import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildTags = dynamic(() => import('~/components/GuildTags'));

import { useUserStore } from '~/store/index';

const GuildTagsPage = () => {
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
				<GuildTags />
			</Box>
		</GuildLayout>
	);
};

export default GuildTagsPage;
