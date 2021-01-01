import { Img } from '@chakra-ui/react';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v8';

const GuildIcon = ({ guild }: { guild?: RESTAPIPartialCurrentUserGuild }) =>
	guild?.icon ? (
		<Img
			rounded="full"
			boxSize="100px"
			src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${guild.icon.startsWith('a_') ? '.gif' : '.png'}`}
			alt={guild.name}
		/>
	) : null;

export default GuildIcon;
