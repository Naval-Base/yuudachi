import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Flex, IconButton, Heading, useDisclosure, VStack } from '@chakra-ui/react';
import { FiMenu, FiX } from 'react-icons/fi';

const GuildNavbar = () => {
	const router = useRouter();
	const { isOpen, onToggle } = useDisclosure();
	const { isOpen: isOpenModules, onToggle: onToggleModules } = useDisclosure();

	const { id } = router.query;

	return (
		<Flex as="nav" align="center" justify="space-around" wrap="wrap">
			<Flex d={{ base: 'block', lg: 'none' }}>
				<Heading size="md">Dashboard Navigation</Heading>
			</Flex>

			<Flex align="center">
				<IconButton
					d={{ base: 'flex', lg: 'none' }}
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
			>
				<VStack px={2}>
					<Link href={`/guilds/${id as string}`}>
						<Button w="100%" variant="ghost">
							Dashboard
						</Button>
					</Link>
					<Button w="100%" variant="ghost" onClick={onToggleModules}>
						Modules
					</Button>
					<Box d={{ base: isOpenModules ? 'block' : 'none' }} w="100%">
						<Link href={`/guilds/${id as string}/modules/moderation`}>
							<Button w="100%">Moderation</Button>
						</Link>
					</Box>
					<Link href={`/guilds/${id as string}/cases`}>
						<Button w="100%" variant="ghost">
							Cases
						</Button>
					</Link>
					<Link href={`/guilds/${id as string}/tags`}>
						<Button w="100%" variant="ghost">
							Tags
						</Button>
					</Link>
				</VStack>
			</Box>
		</Flex>
	);
};

export default GuildNavbar;
