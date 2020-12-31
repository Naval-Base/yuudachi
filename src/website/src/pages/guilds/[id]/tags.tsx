import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildTags = dynamic(() => import('~/components/GuildTags'));

const GuildTagsPage = () => {
	return (
		<GuildLayout>
			<Box mt={10} px={{ base: 5 }}>
				<GuildTags />
			</Box>
		</GuildLayout>
	);
};

export default GuildTagsPage;
