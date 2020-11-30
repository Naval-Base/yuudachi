import { Context } from '../interfaces/Context';
import guilds from './query/guilds';
import guilds_oauth from './query/guilds_oauth';
import guild_roles from './query/guild_roles';

export default {
	Query: {
		guild: (_: any, { guild_id }: { guild_id: string }) => guilds({}, { guild_id }),
		guilds: () => guilds(),
		guilds_oauth: (_: any, __: any, ctx: Context) => guilds_oauth({}, {}, ctx),
		guild_roles: (_: any, { guild_id }: { guild_id: string }) => guild_roles({}, { guild_id }),
	},
};
