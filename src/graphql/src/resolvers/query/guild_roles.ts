import { container } from 'tsyringe';
import API from '@yuudachi/api';

export default (_: any, args: { guild_id: string }) => {
	const api = container.resolve(API);
	return api.guilds.getRoles(args.guild_id);
};
