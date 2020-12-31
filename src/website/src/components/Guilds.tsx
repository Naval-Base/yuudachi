import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Center, Grid, Text } from '@chakra-ui/react';

import GuildsStyles from '~/styles/modules/guilds.module.scss';

const Loading = dynamic(() => import('./Loading'));
const GuildIcon = dynamic(() => import('./GuildIcon'));

import { useQueryOAuthGuilds } from '~/hooks/useQueryOAuthGuilds';

const Guilds = () => {
	const { data, isLoading } = useQueryOAuthGuilds();

	if (isLoading) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return (
		<Grid templateColumns="repeat(auto-fill, 150px)" gap="32px 0px" justifyContent="center">
			{data?.guilds
				.filter((guild) => BigInt(guild.permissions) & BigInt(1 << 5))
				.map((guild, i) => {
					return (
						<Link href={`/guilds/${guild.id as string}`} key={i}>
							<Grid gap="8px 0px" className={GuildsStyles.center}>
								<GuildIcon guild={guild} />
								<Text textAlign="center">{guild.name}</Text>
							</Grid>
						</Link>
					);
				})}
		</Grid>
	);
};

export default Guilds;
