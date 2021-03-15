import { Box, Heading } from '@chakra-ui/react';

import Layout from '~/components/Layout';

const Index = () => (
	<Layout>
		<Box my={{ base: 12 }}>
			<Heading size="lg" textAlign="center">
				Welcome to the Yuudachi dashboard
			</Heading>
		</Box>
	</Layout>
);

export default Index;
