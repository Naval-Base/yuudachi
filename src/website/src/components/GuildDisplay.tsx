import dynamic from 'next/dynamic';
import { Grid, Heading } from '@chakra-ui/react';
import { RESTAPIPartialCurrentUserGuild, RESTGetAPICurrentUserGuildsResult } from 'discord-api-types';

const GuildIcon = dynamic(() => import('~/components/GuildIcon'));

const GuildDisplay = ({
	id,
	guild,
	fallbackGuild,
}: {
	id: string;
	guild?: { guild: RESTAPIPartialCurrentUserGuild | null };
	fallbackGuild?: { guilds: RESTGetAPICurrentUserGuildsResult };
}) =>
	guild?.guild ?? fallbackGuild?.guilds.length ? (
		<Grid
			templateColumns={{ base: 'auto', md: '300px' }}
			gap={{ base: '16px', md: '8px' }}
			justifyItems="center"
			justifyContent="center"
			alignItems="center"
			textAlign="center"
			my={12}
			px={{ base: 0, md: 200 }}
		>
			<GuildIcon guild={guild?.guild ?? fallbackGuild?.guilds.find((guild) => guild.id === id)} />
			<Heading fontSize="2xl">
				{guild?.guild?.name ?? fallbackGuild?.guilds.find((guild) => guild.id === id)?.name}
			</Heading>
		</Grid>
	) : null;

export default GuildDisplay;
