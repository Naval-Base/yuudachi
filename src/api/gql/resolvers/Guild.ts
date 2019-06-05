import { Resolver, ObjectType, Field, ID, Int, FieldResolver, ResolverInterface, Root, Ctx } from 'type-graphql';
import { Context } from '../../';
import { Setting } from '../../models/Settings';
import { GuildSettings } from './GuildSettings';

export interface Guild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: number;
	settings?: GuildSettings;
}

@ObjectType()
export class Guild implements Guild {
	@Field(() => ID)
	public id!: string;

	@Field()
	public name!: string;

	@Field(() => String, { nullable: true })
	public icon!: string | null;

	@Field()
	public owner!: boolean;

	@Field(() => Int)
	public permissions!: number;

	@Field(() => GuildSettings, { nullable: true })
	public settings?: GuildSettings;
}

@Resolver(() => Guild)
export class GuildResolver implements ResolverInterface<Guild> {
	@FieldResolver()
	public async settings(
		@Root() guild: Guild,
		@Ctx() context: Context
	): Promise<GuildSettings | undefined> {
		const settings = context.db.getRepository(Setting);
		const dbGuild = await settings.findOne(guild.id);
		if (!dbGuild) return undefined;
		return dbGuild!.settings;
	}
}
