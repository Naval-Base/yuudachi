import type { Snowflake } from 'discord-api-types/v8';
import { container } from 'tsyringe';
import API from '@yuudachi/api';

import { Context } from '../../interfaces/Context';
import { checkAuth } from '../../util/checkAuth';

export default async (_: any, args: { guild_id?: Snowflake }, { userId }: Context) => {
	const api = container.resolve(API);
	if (args.guild_id) {
		if (!(await checkAuth(args.guild_id, userId))) {
			return null;
		}

		return api.guilds.getGuild(args.guild_id);
	}

	return api.guilds.get();
};
