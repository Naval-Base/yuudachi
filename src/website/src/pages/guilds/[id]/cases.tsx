import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';

import GuildLayout from '~/components/GuildLayout';

const GuildCases = dynamic(() => import('~/components/GuildCases'));

const GuildCasesPage = () => {
	return (
		<GuildLayout>
			<Box mt={10} px={{ base: 5 }}>
				<GuildCases />
			</Box>
		</GuildLayout>
	);
};

export default GuildCasesPage;
