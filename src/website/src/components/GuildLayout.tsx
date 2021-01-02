import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Text, Button, Grid, Center } from '@chakra-ui/react';

const GuildNavbar = dynamic(() => import('~/components/GuildNavbar'));
const Loading = dynamic(() => import('~/components/Loading'));
const GuildDisplay = dynamic(() => import('~/components/GuildDisplay'));

import { useQueryOAuthGuilds } from '~/hooks/useQueryOAuthGuilds';
import { useQueryGuild } from '~/hooks/useQueryGuild';

const GuildLayout = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();

	const { id } = router.query;
	const { data: gqlGuildData, isLoading: isLoadingGuild } = useQueryGuild(id as string);
	const { data: gqlFallbackGuildData, isLoading: isLoadingFallbackGuild } = useQueryOAuthGuilds();

	if (isLoadingGuild || isLoadingFallbackGuild) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	if (gqlGuildData && !gqlGuildData.guild) {
		return (
			<>
				<GuildDisplay id={id as string} guild={gqlGuildData} fallbackGuild={gqlFallbackGuildData} />
				<Box textAlign="center">
					<Text mb={6}>Yuudachi is not in this guild yet.</Text>
					<Link href={''}>
						<Button>Invite</Button>
					</Link>
				</Box>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>{gqlGuildData?.guild?.name} | Yuudachi Dashboard</title>
			</Head>
			<Grid
				templateColumns={{ base: 'auto', md: 'auto', lg: '250px auto' }}
				templateRows={{ base: 'max-content', lg: 'unset' }}
				h="100%"
				w="100%"
			>
				<Box>
					<GuildDisplay id={id as string} guild={gqlGuildData} fallbackGuild={gqlFallbackGuildData} />
					<GuildNavbar />
				</Box>
				<Box>{children}</Box>
			</Grid>
		</>
	);
};

export default GuildLayout;
