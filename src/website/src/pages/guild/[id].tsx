import { useRouter } from 'next/router';
import { Box, Grid, Text, Image } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { useQueryCache } from 'react-query';

import { RootState } from '../../store';
import { useQueryGuilds } from '../../hooks/useQueryGuilds';
import { Guild } from '../../interfaces/Guild';
import GuildSettings from '../../components/GuildSettings';

const GuildPage = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const cache = useQueryCache();
	useQueryGuilds(user.loggedIn, props);

	const { id } = router.query;

	const guild = cache.getQueryData<Guild>(['guilds', id]);

	const GuildDisplay = () =>
		guild ? (
			<Grid
				templateColumns={{ base: 'auto', md: '150px' }}
				gap={{ base: '32px', md: '8px' }}
				justifyItems="center"
				justifyContent="center"
				alignItems="center"
				my={12}
				px={{ base: 0, md: 200 }}
			>
				<Image
					rounded="full"
					size="100px"
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${
						guild.icon.startsWith('a_') ? '.gif' : '.png'
					}`}
					alt={guild.name}
				/>
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
