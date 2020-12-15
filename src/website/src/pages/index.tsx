import { Box, Heading, Text } from '@chakra-ui/react';

import Guilds from '../components/Guilds';

const Index = () => (
	<>
		<Box mt={{ base: 6, lg: 12 }}>
			<Heading size="lg" textAlign="center">
				Welcome to the Yuudachi dashboard
			</Heading>
		</Box>
		<Box mt={{ base: 12, lg: 24 }} mb={{ base: 12 }} px={{ base: 0, md: 200 }}>
			<Box px={8} pb={8}>
				<Heading size="lg">Manage</Heading>
				<Text>Severs you can manage</Text>
			</Box>
			<Guilds />
		</Box>
	</>
);

export default Index;
