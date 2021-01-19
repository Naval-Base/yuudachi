import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Center, Grid, Text } from '@chakra-ui/react';

import GuildsStyles from '~/styles/modules/guilds.module.scss';

const Loading = dynamic(() => import('./Loading'));
const GuildIcon = dynamic(() => import('./GuildIcon'));

import { useUserStore } from '~/store/index';

import { useQueryOAuthGuilds } from '~/hooks/useQueryOAuthGuilds';

const Guilds = () => {
	const user = useUserStore();
	const { data: gqlOAuthGuildsData, isLoading: isLoadingOAuthGuilds } = useQueryOAuthGuilds();

	const oAuthGuildsData = useMemo(
		() => gqlOAuthGuildsData?.guilds?.filter((guild) => BigInt(guild.permissions) & BigInt(1 << 5)),
		[gqlOAuthGuildsData],
	);

	if (!user.loggedIn || isLoadingOAuthGuilds) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return (
		<Grid templateColumns="repeat(auto-fit, 150px)" gap="32px 0px" justifyContent="center">
			{oAuthGuildsData?.map((guild, i) => (
				<Link href={`/guilds/${guild.id as string}`} key={i}>
					<Grid gap="8px 0px" className={GuildsStyles.center}>
						<GuildIcon guild={guild} />
						<Text textAlign="center">{guild.name}</Text>
					</Grid>
				</Link>
			))}
		</Grid>
	);
};

export default Guilds;
