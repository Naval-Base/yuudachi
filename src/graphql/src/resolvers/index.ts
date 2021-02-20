import { Context } from '../interfaces/Context';
import guilds from './query/guilds';
import guilds_oauth from './query/guilds_oauth';
import guild_channels from './query/guild_channels';
import guild_roles from './query/guild_roles';
import user from './query/user';

export default {
	Query: {
		guild: (_: any, { guild_id }: { guild_id: `${bigint}` }) => guilds({}, { guild_id }),
		guilds: () => guilds(),
		guilds_oauth: (_: any, __: any, ctx: Context) => guilds_oauth({}, {}, ctx),
		guild_channels: (_: any, { guild_id }: { guild_id: `${bigint}` }) => guild_channels({}, { guild_id }),
		guild_roles: (_: any, { guild_id }: { guild_id: `${bigint}` }) => guild_roles({}, { guild_id }),
		user: (_: any, { user_id }: { user_id: `${bigint}` }) => user({}, { user_id }),
	},
};
