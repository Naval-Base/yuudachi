import { Resolver, ObjectType, Field, ID, Int, FieldResolver, ResolverInterface, Root, Ctx } from 'type-graphql';
import { Context } from '../../';
import { Setting } from '../../models/Settings';
import { GuildSettings } from './GuildSettings';
import { channelUnion } from './Channel';
import { Role } from './Role';

export interface Guild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: number;
	channels?: Array<typeof channelUnion>;
	roles?: Role[];
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

	@Field(() => [channelUnion], { nullable: true })
	public channels?: Array<typeof channelUnion>;

	@Field(() => [Role], { nullable: true })
	public roles?: Role[];

	@Field(() => GuildSettings, { nullable: true })
	public settings?: GuildSettings;
}

@Resolver(() => Guild)
export class GuildResolver implements ResolverInterface<Guild> {
	@FieldResolver()
	public async channels(
		@Root() guild: Guild,
		@Ctx() context: Context
	): Promise<Array<typeof channelUnion> | undefined> {
		const { success, d }: { success: boolean; d: { channels: string[] } } = await context.node.send({ type: 'GUILD', id: guild.id });
		if (!success) return undefined;
		const promises = d.channels.map((c: string) => context.node.send({ type: 'CHANNEL', id: c }));
		const resolved = await Promise.all(promises);
		return resolved.map(({ d }: { d: typeof channelUnion }) => d);
	}

	@FieldResolver()
	public async roles(
		@Root() guild: Guild,
		@Ctx() context: Context
	): Promise<Role[] | undefined> {
		const { success, d }: { success: boolean; d: { roles: string[] } } = await context.node.send({ type: 'GUILD', id: guild.id });
		if (!success) return undefined;
		const promises = d.roles.map((r: string) => context.node.send({ type: 'ROLE', guildId: guild.id, id: r }));
		const resolved = await Promise.all(promises);
		return resolved.map(({ d }: { d: Role }) => d);
	}

	@FieldResolver()
	public async settings(
		@Root() guild: Guild,
		@Ctx() context: Context
	): Promise<GuildSettings | undefined> {
		const settings = context.db.getRepository(Setting);
		const dbGuild = await settings.findOne(guild.id);
		if (!dbGuild) return undefined;
		return dbGuild.settings;
	}
}
