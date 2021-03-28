import type { Snowflake } from 'discord-api-types/v8';
import { container } from 'tsyringe';
import API from '@yuudachi/api';

import { checkAuth } from '../../util/checkAuth';

export default async (_: any, args: { guild_id: Snowflake }) => {
	const api = container.resolve(API);

	if (!(await checkAuth(args.guild_id))) {
		return [];
	}

	return api.guilds.getRoles(args.guild_id);
};
