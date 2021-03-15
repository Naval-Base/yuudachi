import { container } from 'tsyringe';
import API from '@yuudachi/api';

import { checkAuth } from '../../util/checkAuth';

export default async (_?: any, args?: { guild_id?: `${bigint}` }) => {
	const api = container.resolve(API);
	if (args?.guild_id) {
		if (!(await checkAuth(args.guild_id))) {
			return null;
		}

		return api.guilds.getGuild(args.guild_id);
	}

	return api.guilds.get();
};
