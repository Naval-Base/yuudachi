import type { Snowflake } from 'discord-api-types/v8';
import { CaseAction } from '@yuudachi/types';

import { Context } from '../interfaces/Context';
import guilds from './query/guilds';
import guild_action from './query/guild_action';
import guilds_oauth from './query/guilds_oauth';
import guild_channels from './query/guild_channels';
import guild_roles from './query/guild_roles';
import user from './query/user';

export default {
	Query: {
		guild: (_: any, { guild_id }: { guild_id: Snowflake }, ctx: Context) => guilds({}, { guild_id }, ctx),
		guild_action: (
			_: any,
			args: {
				action: {
					guild_id: Snowflake;
					action: CaseAction;
					reason?: string;
					moderatorId: Snowflake;
					targetId: Snowflake;
					contextMessageId?: Snowflake;
					referenceId?: number;
				};
			},
			ctx: Context,
		) => guild_action({}, args, ctx),
		guilds: (_: any, __any: any, ctx: Context) => guilds(null, {}, ctx),
		guilds_oauth: (_: any, __: any, ctx: Context) => guilds_oauth({}, {}, ctx),
		guild_channels: (_: any, { guild_id }: { guild_id: Snowflake }, ctx: Context) =>
			guild_channels({}, { guild_id }, ctx),
		guild_roles: (_: any, { guild_id }: { guild_id: Snowflake }, ctx: Context) => guild_roles({}, { guild_id }, ctx),
		user: (_: any, { user_id }: { user_id: Snowflake }) => user({}, { user_id }),
	},
};
