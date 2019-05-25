import { Resolver, Query, Ctx, ObjectType, Field, ID, Int, ResolverInterface, FieldResolver, Root } from 'type-graphql';
import { Context } from '../../';
import { Guild } from './Guild';
import fetch from 'node-fetch';

export interface User {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot: boolean | null;
	locale: string | null;
	verified: string | null;
	email: string | null;
	flags: number | null;
	premium_type: number | null;
	guilds: Guild[];
}

@ObjectType()
export class User implements User {
	@Field(() => ID)
	public id!: string;

	@Field()
	public username!: string;

	@Field()
	public discriminator!: string;

	@Field(() => String, { nullable: true })
	public avatar!: string | null;

	@Field(() => Boolean, { nullable: true })
	public bot!: boolean | null;

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

	@Field(() => [Guild])
	public guilds!: Guild[];
}

@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
	@Query(() => User, { nullable: true })
	public me(
		@Ctx() context: Context
	): User | null {
		if (!context.req.user) {
			return null;
		}
		return context.req.user;
	}

	@FieldResolver()
	public async guilds(
		@Root() _: User,
		@Ctx() context: Context
	): Promise<Guild[]> {
		const guilds = await (await fetch('https://discordapp.com/api/users/@me/guilds', {
			headers: {
				authorization: `Bearer ${context.req.token}`
			}
		})).json();

		return guilds;
	}
}
