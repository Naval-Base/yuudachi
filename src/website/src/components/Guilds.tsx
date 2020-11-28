import Link from 'next/link';
import { Grid, Text, Img } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

import GuildsStyles from '../styles/modules/Guilds.module.scss';

import { RootState } from '../store';
import { useQueryGuilds } from '../hooks/useQueryGuilds';

const Guilds = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const { data } = useQueryGuilds(user.loggedIn, props);

	return (
		<Grid templateColumns="repeat(auto-fill, 150px)" gap="32px 0px" justifyContent="center">
			{data?.guilds
				.filter((guild) => (guild.permissions & (1 << 5)) === 1 << 5)
				.map((guild, i) => {
					return (
						<Link href={`/guild/${guild.id}`} key={i}>
							<Grid gap="8px 0px" className={GuildsStyles.center}>
								<Img
									rounded="full"
									boxSize="100px"
									src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${
										guild.icon.startsWith('a_') ? '.gif' : '.png'
									}`}
									alt={guild.name}
								/>
								<Text textAlign="center">{guild.name}</Text>
							</Grid>
						</Link>
					);
				})}
		</Grid>
	);
};

export default Guilds;
