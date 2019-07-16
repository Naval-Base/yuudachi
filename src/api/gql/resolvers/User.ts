import { Resolver, Query, Ctx, ObjectType, Field, ID, Int, ResolverInterface, FieldResolver, Root, Arg } from 'type-graphql';
import { Context } from '../../';
import { OAuthGuild } from './Guild';
import fetch from 'node-fetch';

interface User {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

export interface OAuthUser extends User {
	bot: boolean | null;
	locale: string | null;
	verified: string | null;
	email: string | null;
	flags: number | null;
	premium_type: number | null;
	guilds: OAuthGuild[];
}

export interface IPCUser extends User {
	bot: boolean;
	tag: string;
	createdTimestamp: number;
	defaultAvatarURL: string;
	avatarURL: string | null;
	displayAvatarURL: string;
}

@ObjectType()
export class OAuthUser implements OAuthUser {
	@Field(() => ID)
	public id!: string;

	@Field(() => Boolean, { nullable: true })
	public bot!: boolean | null;

	@Field()
	public username!: string;

	@Field()
	public discriminator!: string;

	@Field(() => String, { nullable: true })
	public avatar!: string | null;

	@Field(() => String, { nullable: true })
	public locale!: string | null;

	@Field(() => String, { nullable: true })
	public verified!: string | null;

	@Field(() => String, { nullable: true })
	public email!: string | null;

	@Field(() => Int, { nullable: true })
	public flags!: number | null;

	@Field(() => Int, { nullable: true })
	public premium_type!: number | null;

	@Field(() => [OAuthGuild])
	public guilds!: OAuthGuild[];
}

@ObjectType()
export class IPCUser implements IPCUser {
	@Field(() => ID)
	public id!: string;

	@Field(() => Boolean)
	public bot!: boolean;

	@Field()
	public username!: string;

	@Field()
	public discriminator!: string;

	@Field()
	public tag!: string;

	@Field(() => String, { nullable: true })
	public avatar!: string | null;

	@Field(() => Int)
	public createdTimestamp!: number;

	@Field()
	public defaultAvatarURL!: string;

	@Field(() => String, { nullable: true })
	public avatarURL!: string | null;

	@Field()
	public displayAvatarURL!: string;
}

@Resolver(() => OAuthUser)
export class OAuthUserResolver implements ResolverInterface<OAuthUser> {
	@Query(() => OAuthUser, { nullable: true })
	public me(
		@Ctx() context: Context
	): OAuthUser | undefined {
		if (!context.req.user) return undefined;
		return context.req.user;
	}

	@FieldResolver()
	public async guilds(
		@Root() _: OAuthUser,
		@Ctx() context: Context,
		@Arg('id', { nullable: true }) id?: string
	): Promise<OAuthGuild[]> {
		const guilds = await (await fetch('https://discordapp.com/api/users/@me/guilds', {
			headers: {
				authorization: `Bearer ${context.req.token}`
			}
		})).json() as OAuthGuild[];
		if (id) {
			return guilds.filter(guild => guild.id === id);
		}

		return guilds;
	}
}
