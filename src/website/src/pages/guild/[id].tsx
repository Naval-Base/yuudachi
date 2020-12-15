import { useRouter } from 'next/router';
import { Box, Grid, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import GuildIcon from '../../components/GuildIcon';

import { RootState } from '../../store';
import { useQueryOAuthGuilds } from '../../hooks/useQueryOAuthGuilds';
import { useQueryGuild } from '../../hooks/useQueryGuild';
import GuildSettings from '../../components/GuildSettings';

const GuildPage = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();

	const { id } = router.query;
	const { data: gqlGuildData } = useQueryGuild(id as string, user.loggedIn, props);
	const { data: gqlFallbackGuildData } = useQueryOAuthGuilds(user.loggedIn, props);

	const GuildDisplay = () =>
		gqlGuildData?.guild ?? gqlFallbackGuildData?.guilds.length ? (
			<Grid
				templateColumns={{ base: 'auto', md: '300px' }}
				gap={{ base: '32px', md: '8px' }}
				justifyItems="center"
				justifyContent="center"
				alignItems="center"
				textAlign="center"
				my={12}
				px={{ base: 0, md: 200 }}
			>
				<GuildIcon guild={gqlGuildData?.guild ?? gqlFallbackGuildData?.guilds.find((guild) => guild.id === id)} />
				<Text fontSize="2xl">
					{gqlGuildData?.guild?.name ?? gqlFallbackGuildData?.guilds.find((guild) => guild.id === id)?.name}
				</Text>
			</Grid>
		) : (
			<></>
		);

	return (
		<>
			<GuildDisplay />
			<Box px={{ base: 0, md: 200 }}>
				<Box px={{ base: 8, md: 16 }} pb={{ base: 16 }}>
					<GuildSettings />
				</Box>
			</Box>
		</>
	);
};

export default GuildPage;
