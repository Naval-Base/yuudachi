import dynamic from 'next/dynamic';
import { Img } from '@chakra-ui/react';
import type { RESTAPIPartialCurrentUserGuild, RESTGetAPIGuildResult } from 'discord-api-types/v8';

const MotionBox = dynamic(() => import('~/components/MotionBox'));

const GuildIcon = ({ guild }: { guild?: RESTGetAPIGuildResult | RESTAPIPartialCurrentUserGuild }) =>
	guild?.icon ? (
		<MotionBox
			whileHover={{ scale: 1.05, rotate: 5 }}
			whileTap={{ scale: 0.95 }}
			transition={{ type: 'spring', stiffness: 200 }}
		>
			<Img
				rounded="full"
				boxSize="100px"
				src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${
					guild.icon.startsWith('a_') ? '.gif' : '.png'
				}`}
				alt={guild.name}
			/>
		</MotionBox>
	) : null;

export default GuildIcon;
