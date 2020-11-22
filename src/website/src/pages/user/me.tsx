import { Box, Grid, Text, Img, Heading } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import Guilds from '../../components/Guilds';

import { RootState } from '../../store';

const UserPage = () => {
	const user = useSelector((state: RootState) => state.user);

	const UserDisplay = () =>
		user.loggedIn ? (
			<>
				<Img rounded="full" boxSize="100px" src={user.avatar} alt={user.username} />
				<Heading>{user.username}</Heading>
			</>
		) : (
			<></>
		);

	return (
		<>
			<Grid
				templateColumns={{ base: 'auto', md: '150px' }}
				gap={{ base: '32px', md: '8px' }}
				autoFlow="column"
				justifyItems="center"
				justifyContent="center"
				alignItems="center"
				my={12}
				px={{ base: 0, md: 200 }}
			>
				<UserDisplay />
			</Grid>
			<Box mb={12} px={{ base: 0, md: 200 }}>
				<Box px={16} pb={8}>
					<Heading>Manage</Heading>
					<Text>Severs you can manage</Text>
				</Box>
				<Guilds />
			</Box>
		</>
	);
};

export default UserPage;
