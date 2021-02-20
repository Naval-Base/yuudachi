import { container } from 'tsyringe';
import API from '@yuudachi/api';

export default async (_?: any, args?: { guild_id?: `${bigint}` }) => {
	const api = container.resolve(API);
	const guilds = await api.guilds.get();

	if (args?.guild_id) {
		return guilds.find((guild) => guild.id === args.guild_id);
	}
	return guilds;
};
