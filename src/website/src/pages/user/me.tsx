import { Grid, Img, Heading } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

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
				my={{ base: 12 }}
				px={{ base: 0, md: 200 }}
			>
				<UserDisplay />
			</Grid>
		</>
	);
};

export default UserPage;
