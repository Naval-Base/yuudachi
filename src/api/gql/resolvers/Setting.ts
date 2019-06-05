import { Resolver, Query, Ctx, Arg } from 'type-graphql';
import { GuildSettings } from './GuildSettings';
import { Context } from '../../';
import { Setting } from '../../models/Settings';

@Resolver()
export class SettingResolver {
	@Query(() => GuildSettings)
	public async setting(
		@Arg('id') id: string,
		@Ctx() context: Context
	): Promise<GuildSettings | undefined> {
		const settings = context.db.getRepository(Setting);
		const dbGuild = await settings.findOne(id);
		if (!dbGuild) return undefined;
		return dbGuild!.settings;
	}
}
