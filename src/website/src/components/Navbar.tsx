import Link from 'next/link';
import { Box, Flex, Button, IconButton, Img, useDisclosure } from '@chakra-ui/react';
import { FiMenu, FiX } from 'react-icons/fi';

import { useUserStore } from '~/store/index';

const Navbar = () => {
	const user = useUserStore();
	const { isOpen, onToggle } = useDisclosure();

	const LoginButton = () =>
		user.loggedIn ? (
			<>
				<Link href="/dashboard">
					<Button variant="solid" justifyContent={{ base: 'start', md: 'unset' }} mr={2}>
						Dashboard
					</Button>
				</Link>
				<Link href="/dashboard">
					<Button variant="ghost" justifyContent={{ base: 'start', md: 'unset' }}>
						<Img mr={2} rounded="full" boxSize="25px" src={user.avatar ?? ''} alt={user.username!} />
						<Box>{user.username}</Box>
					</Button>
				</Link>
			</>
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
					d={{ base: 'flex', md: 'none' }}
					aria-label="Open menu"
					variant="ghost"
					icon={isOpen ? <FiX /> : <FiMenu />}
					onClick={onToggle}
				/>
			</Flex>

			<Box
				d={{ base: isOpen ? 'flex' : 'none', md: 'block' }}
				flexDirection={{ base: 'column', md: 'unset' }}
				width={{ base: 'full', md: 'auto' }}
			>
				<LoginButton />
			</Box>
		</Flex>
	);
};

export default Navbar;
