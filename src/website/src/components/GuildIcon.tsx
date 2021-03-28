import { Img } from '@chakra-ui/react';
import type { RESTAPIPartialCurrentUserGuild, RESTGetAPIGuildResult } from 'discord-api-types/v8';

const GuildIcon = ({ guild }: { guild?: RESTGetAPIGuildResult | RESTAPIPartialCurrentUserGuild }) =>
	guild?.icon ? (
		<Img
			rounded="full"
			boxSize="100px"
			src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${guild.icon.startsWith('a_') ? '.gif' : '.png'}`}
			alt={guild.name}
		/>
	) : null;

export default GuildIcon;
