import dynamic from 'next/dynamic';
import { Grid, Box } from '@chakra-ui/react';

const Navbar = dynamic(() => import('~/components/Navbar'));

import { useQueryMe } from '~/hooks/useQueryMe';

const Layout = (props: any) => {
	useQueryMe(props);

	return (
		<Grid templateRows="auto 1fr auto" h="100%">
			<Navbar />
			<Box w="100%" h="100%">
				{props.children}
			</Box>
			<Box w="100%" h="100%">
				Footer
			</Box>
		</Grid>
	);
};

export default Layout;
