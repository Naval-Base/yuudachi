import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Text, Button } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

const Loading = dynamic(() => import('~/components/Loading'));
const GuildDisplay = dynamic(() => import('~/components/GuildDisplay'));
const GuildSettings = dynamic(() => import('~/components/GuildSettings'));

import { RootState } from '~/store/index';

import { useQueryOAuthGuilds } from '~/hooks/useQueryOAuthGuilds';
import { useQueryGuild } from '~/hooks/useQueryGuild';

const GuildPage = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();

	const { id } = router.query;
	const { data: gqlGuildData, isLoading: isLoadingGuild } = useQueryGuild(id as string, user.loggedIn, props);
	const { data: gqlFallbackGuildData, isLoading: isLoadingFallbackGuild } = useQueryOAuthGuilds(user.loggedIn, props);

	if (isLoadingGuild || isLoadingFallbackGuild) {
		return <Loading />;
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
			<GuildDisplay id={id as string} guild={gqlGuildData} fallbackGuild={gqlFallbackGuildData} />
			<Box px={{ base: 0, md: 200 }}>
				<Box px={{ base: 8, md: 16 }} pb={{ base: 16 }}>
					<Box textAlign="center">
						<GuildSettings />
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default GuildPage;
