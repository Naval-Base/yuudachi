import { Resolver, ObjectType, Field, ID, Int, FieldResolver, ResolverInterface, Root, Ctx, Query, Arg } from 'type-graphql';
import { Context } from '../../';
import { Setting } from '../../models/Settings';
import { GuildSettings } from './GuildSettings';
import { channelUnion } from './Channel';
import { Role } from './Role';

interface Guild {
	id: string;
	name: string;
	icon: string | null;
	channels?: Array<typeof channelUnion>;
	roles?: Role[];
	settings?: GuildSettings;
}

export interface OAuthGuild extends Guild {
	owner: boolean;
	permissions: number;
}

export interface IPCGuild extends Guild {
	splash: string | null;
	region: string;
	memberCount: number;
	large: boolean;
	vanityURLCode: string | null;
	description: string | null;
	banner: string | null;
	ownerID: string;
	createdTimestamp: number;
	iconURL: string | null;
	splashURL: string | null;
	bannerURL: string | null;
}

@ObjectType()
export class OAuthGuild implements OAuthGuild {
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

@ObjectType()
export class IPCGuild implements IPCGuild {
	@Field(() => ID)
	public id!: string;

	@Field()
	public name!: string;

	@Field(() => String, { nullable: true })
	public icon!: string | null;

	@Field(() => String, { nullable: true })
	public splash!: string | null;

	@Field()
	public region!: string;

	@Field(() => Int)
	public memberCount!: number;

	@Field()
	public large!: boolean;

	@Field(() => String, { nullable: true })
	public vanityURLCode!: string | null;

	@Field(() => String, { nullable: true })
	public description!: string | null;

	@Field(() => String, { nullable: true })
	public banner!: string | null;

	@Field()
	public ownerID!: string;

	@Field(() => Int)
	public createdTimestamp!: number;

	@Field(() => String, { nullable: true })
	public iconURL!: string | null;

	@Field(() => String, { nullable: true })
	public splashURL!: string | null;

	@Field(() => String, { nullable: true })
	public bannerURL!: string | null;

	@Field(() => [channelUnion], { nullable: true })
	public channels?: Array<typeof channelUnion>;

	@Field(() => [Role], { nullable: true })
	public roles?: Role[];

	@Field(() => GuildSettings, { nullable: true })
	public settings?: GuildSettings;
}

@Resolver(() => IPCGuild)
export class GuildResolver implements ResolverInterface<IPCGuild> {
	@Query(() => IPCGuild, { nullable: true })
	public async guild(
		@Ctx() context: Context,
		@Arg('id') id: string
	): Promise<IPCGuild | undefined> {
		if (!context.req.user) {
			return undefined;
		}
		const { success, d }: { success: boolean; d: any } = await context.node.send({ type: 'GUILD', id });
		if (!success) return undefined;
		return d;
	}

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
