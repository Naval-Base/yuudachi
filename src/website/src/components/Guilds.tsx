import Link from 'next/link';
import { Grid, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import GuildsStyles from '../styles/modules/Guilds.module.scss';

import GuildIcon from './GuildIcon';

import { RootState } from '../store';
import { useQueryOAuthGuilds } from '../hooks/useQueryOAuthGuilds';

const Guilds = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const { data } = useQueryOAuthGuilds(user.loggedIn, props);

	return (
		<Grid templateColumns="repeat(auto-fill, 150px)" gap="32px 0px" justifyContent="center">
			{data?.guilds
				.filter((guild) => BigInt(guild.permissions) & BigInt(1 << 5))
				.map((guild, i) => {
					return (
						<Link href={`/guild/${guild.id}`} key={i}>
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
