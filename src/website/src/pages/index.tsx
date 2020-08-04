import Link from 'next/link';
import {
	Grid,
	Box,
	Flex,
	Stack,
	Button,
	IconButton
} from '@chakra-ui/core';

const Index = () => {
	return (
		<Grid templateRows="auto 1fr auto" h="100%">
			<Box w="100%" h="100%" bg="gray.800">
				<Flex p="6" align="center" justify="space-between">
					<Flex align="center">
						<Link href="/">
							<Button variant="ghost">Yuudachi</Button>
						</Link>
						<Stack isInline as="nav" spacing="4" ml="24px" display={{ base: 'none', md: 'flex' }}>
							<Button variant="link">Dashboard</Button>
						</Stack>
					</Flex>
					<Flex align="center">
						<Button variant="ghost">Log In</Button>
						<IconButton
							display={{ sm: 'inline-flex', md: 'none' }}
							aria-label="Open menu"
							fontSize="20px"
							variant="ghost"
							icon="add"
						/>
					</Flex>
				</Flex>
			</Box>
			<Box w="100%" h="100%" bg="gray.900">
				<Box color="white">Main</Box>
			</Box>
			<Box w="100%" h="100%" bg="gray.800">
				<Box color="white">Footer</Box>
			</Box>
		</Grid>
	);
};

export default Index;
