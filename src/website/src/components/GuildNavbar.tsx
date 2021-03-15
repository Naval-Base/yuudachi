import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Flex, IconButton, Heading, useDisclosure, VStack } from '@chakra-ui/react';
import { FiMenu, FiX } from 'react-icons/fi';

const GuildNavbar = () => {
	const router = useRouter();
	const { isOpen, onToggle } = useDisclosure();
	const { isOpen: isOpenModules, onToggle: onToggleModules } = useDisclosure({
		defaultIsOpen: router.route === '/guilds/[id]/modules/moderation',
	});

	const { id } = router.query;

	return (
		<Flex as="nav" align="center" justifyContent="space-between" wrap="wrap" px={{ base: 50, lg: 4 }}>
			<Flex d={{ base: 'block', lg: 'none' }} mb={{ base: 4, lg: 0 }}>
				<Heading size="md" color="white">
					Navigation
				</Heading>
			</Flex>

			<Flex align="center">
				<IconButton
					d={{ base: 'flex', lg: 'none' }}
					mb={{ base: 4, lg: 0 }}
					aria-label="Open menu"
					variant="ghost"
					icon={isOpen ? <FiX /> : <FiMenu />}
					onClick={onToggle}
				/>
			</Flex>

			<Box
				d={{ base: isOpen ? 'flex' : 'none', lg: 'block' }}
				flexDirection={{ base: 'column' }}
				width={{ base: 'full' }}
				mb={{ base: 4, lg: 0 }}
			>
				<VStack px={2}>
					<Link href={`/guilds/${id as string}`}>
						<Button
							w="100%"
							variant={router.route === '/guilds/[id]' ? 'solid' : 'ghost'}
							color={router.route === '/guilds/[id]' ? 'blue.200' : 'white'}
						>
							Dashboard
						</Button>
					</Link>
					<Button w="100%" variant="ghost" onClick={onToggleModules}>
						Modules
					</Button>
					<Box d={{ base: isOpenModules ? 'block' : 'none' }} w="100%">
						<Link href={`/guilds/${id as string}/modules/moderation`}>
							<Button
								variant="ghost"
								color={router.route === '/guilds/[id]/modules/moderation' ? 'blue.200' : 'white'}
								bg="gray.700"
								w="100%"
							>
								Moderation
							</Button>
						</Link>
					</Box>
					<Link href={`/guilds/${id as string}/cases`}>
						<Button
							w="100%"
							variant={router.route === '/guilds/[id]/cases' ? 'solid' : 'ghost'}
							color={router.route === '/guilds/[id]/cases' ? 'blue.200' : 'white'}
						>
							Cases
						</Button>
					</Link>
					<Link href={`/guilds/${id as string}/tags`}>
						<Button
							w="100%"
							variant={router.route === '/guilds/[id]/tags' ? 'solid' : 'ghost'}
							color={router.route === '/guilds/[id]/tags' ? 'blue.200' : 'white'}
						>
							Tags
						</Button>
					</Link>
				</VStack>
			</Box>
		</Flex>
	);
};

export default GuildNavbar;
