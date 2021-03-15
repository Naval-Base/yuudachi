import { useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DarkMode, Box, Heading, Button, Grid, Center } from '@chakra-ui/react';
import { FiCornerUpLeft } from 'react-icons/fi';

const GuildNavbar = dynamic(() => import('~/components/GuildNavbar'));
const Loading = dynamic(() => import('~/components/Loading'));
const GuildDisplay = dynamic(() => import('~/components/GuildDisplay'));

import { useUserStore } from '~/store/index';

import { useQueryMe } from '~/hooks/useQueryMe';
import { useQueryOAuthGuilds } from '~/hooks/useQueryOAuthGuilds';
import { useQueryGuild } from '~/hooks/useQueryGuild';

const GuildLayout = ({ children }: { children: React.ReactNode }) => {
	useQueryMe();
	const user = useUserStore();
	const router = useRouter();

	const { id } = router.query;
	const { data: gqlGuildData, isLoading: isLoadingGuild } = useQueryGuild(id as string);
	const { data: gqlFallbackGuildData, isLoading: isLoadingFallbackGuild } = useQueryOAuthGuilds();

	const guildData = useMemo(() => gqlGuildData, [gqlGuildData]);
	const guildFallbackData = useMemo(() => gqlFallbackGuildData, [gqlFallbackGuildData]);

	if (!user.loggedIn || isLoadingGuild || isLoadingFallbackGuild) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return (
		<>
			<Head>
				<title>
					{guildData?.guild?.name ?? gqlFallbackGuildData?.guilds?.find((guild) => guild.id === id)?.name} | Yuudachi
					Dashboard
				</title>
			</Head>
			<Grid
				templateColumns={{ base: 'auto', lg: '300px auto' }}
				templateRows={{ base: 'auto', lg: 'unset' }}
				h="100%"
				w="100%"
			>
				<DarkMode>
					<Box bg="gray.800">
						<Box mt={4} px={{ base: 50, lg: 6 }}>
							<Link href="/dashboard">
								<Button variant="link" leftIcon={<FiCornerUpLeft />}>
									Go back
								</Button>
							</Link>
						</Box>
						<GuildDisplay id={id as string} guild={guildData} fallbackGuild={guildFallbackData} />
						{guildData && !guildData.guild ? null : <GuildNavbar />}
					</Box>
				</DarkMode>
				{guildData && !guildData.guild ? (
					<Center>
						<Box textAlign="center">
							<Heading fontSize="xl" mb={6}>
								Yuudachi is not in this guild yet.
							</Heading>
							<Link href={''}>
								<Button>Invite</Button>
							</Link>
						</Box>
					</Center>
				) : (
					children
				)}
			</Grid>
		</>
	);
};

export default GuildLayout;
