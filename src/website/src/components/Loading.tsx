import { Box, Text, Spinner } from '@chakra-ui/react';

const Loading = () => (
	<Box textAlign="center">
		<Text>Loading...</Text>
		<Spinner mt={6} size="lg" />
	</Box>
);

export default Loading;
