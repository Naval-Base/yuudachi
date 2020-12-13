import { useRouter } from 'next/router';
import { Box, Grid, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { useQueryCache } from 'react-query';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';

import GuildIcon from '../../components/GuildIcon';

import { RootState } from '../../store';
import { useQueryOAuthGuilds } from '../../hooks/useQueryOAuthGuilds';
import GuildSettings from '../../components/GuildSettings';

const GuildPage = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const cache = useQueryCache();
	useQueryOAuthGuilds(user.loggedIn, props);

	const { id } = router.query;

	const guild = cache.getQueryData<RESTAPIPartialCurrentUserGuild>(['guilds', id]);

	const GuildDisplay = () =>
		guild ? (
			<Grid
				templateColumns={{ base: 'auto', md: '150px' }}
				gap={{ base: '32px', md: '8px' }}
				justifyItems="center"
				justifyContent="center"
				alignItems="center"
				textAlign="center"
				my={12}
				px={{ base: 0, md: 200 }}
			>
				<GuildIcon guild={guild} />
				<Text fontSize="2xl">{guild.name}</Text>
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
