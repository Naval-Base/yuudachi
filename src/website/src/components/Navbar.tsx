import { useState } from 'react';
import Link from 'next/link';
import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { RootState } from '~/store/index';

const Navbar = () => {
	const user = useSelector((state: RootState) => state.user);
	const [show, setShow] = useState(false);
	const handleToggleShow = () => setShow(!show);

	const LoginButton = () =>
		user.loggedIn ? (
			<Link href="/users/me">
				<Button variant="ghost" justifyContent={{ base: 'start', md: 'unset' }}>
					{user.username}
				</Button>
			</Link>
		) : (
			<Link href="http://localhost:3600/api/auth/discord">
				<Button variant="ghost" justifyContent={{ base: 'start', md: 'unset' }}>
					Log In
				</Button>
			</Link>
		);

	return (
		<Flex as="nav" p={4} align="center" justify="space-between" wrap="wrap">
			<Flex align="center" mr={5}>
				<Link href="/">
					<Button variant="ghost">Yuudachi</Button>
				</Link>
			</Flex>

			<Flex align="center">
				<IconButton
					display={{ base: 'flex', md: 'none' }}
					aria-label="Open menu"
					fontSize="20px"
					variant="ghost"
					icon={<FiMenu />}
					onClick={handleToggleShow}
				/>
			</Flex>

			<Box
				display={{ base: show ? 'flex' : 'none', md: 'block' }}
				flexDirection={{ base: 'column', md: 'unset' }}
				width={{ base: 'full', md: 'auto' }}
				flexGrow={{ base: 0, md: 1 }}
				justifyContent="start"
				py={{ base: 2, md: 'unset' }}
			>
				<Box display={{ base: 'block', md: 'none' }}>
					<LoginButton />
				</Box>
			</Box>

			<Box display={{ base: 'none', md: 'block' }}>
				<LoginButton />
			</Box>
		</Flex>
	);
};

export default Navbar;
