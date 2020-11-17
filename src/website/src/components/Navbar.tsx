import { useState } from 'react';
import Link from 'next/link';
import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { RootState } from '../store';

const Navbar = () => {
	const user = useSelector((state: RootState) => state.user);
	const [show, setShow] = useState(false);
	const handleToggleShow = () => setShow(!show);

	const LoginButton = () =>
		user.loggedIn ? (
			<Link href="/user/me">
				<Button variant="ghost">{user.username}</Button>
			</Link>
		) : (
			<Link href="http://localhost:3500/api/auth/discord">
				<Button variant="ghost">Log In</Button>
			</Link>
		);

	return (
		<Flex as="nav" p={6} align="center" justify="space-between" wrap="wrap" bg="gray.800">
			<Flex align="center" mr={5}>
				<Link href="/">
					<Button variant="ghost">Yuudachi</Button>
				</Link>
			</Flex>

			<Flex align="center">
				<IconButton
					display={{ base: 'inline-flex', md: 'none' }}
					aria-label="Open menu"
					fontSize="20px"
					variant="ghost"
					icon={<FiMenu />}
					onClick={handleToggleShow}
				/>
			</Flex>

			<Box
				display={{ base: show ? 'flex' : 'none', md: 'flex' }}
				width={{ base: 'full', md: 'auto' }}
				alignItems="center"
				flexGrow={1}
			>
				<Button mt={{ base: 4, md: 0 }} variant="link" display="block">
					Dashboard
				</Button>
			</Box>

			<Box display={{ base: show ? 'flex' : 'none', md: 'flex' }} mt={{ base: 4, md: 0 }}>
				<LoginButton />
			</Box>
		</Flex>
	);
};

export default Navbar;
