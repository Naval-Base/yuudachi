import { Img } from '@chakra-ui/react';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v6';

const GuildIcon = ({ guild }: { guild: RESTAPIPartialCurrentUserGuild }) => {
	return guild.icon ? (
		<Img
			rounded="full"
			boxSize="100px"
			src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${guild.icon.startsWith('a_') ? '.gif' : '.png'}`}
			alt={guild.name}
		/>
	) : (
		<></>
	);
};

export default GuildIcon;
