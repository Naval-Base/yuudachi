import { ObjectType, Field, Int, ID, Resolver, ResolverInterface, FieldResolver, Ctx, Root } from 'type-graphql';
import { Context } from '../../';
import { Role } from './Role';

export interface GuildMember {
	id: string;
	displayColor: string;
	displayName: string;
	joinedTimestamp: number;
	roles?: Role[];
}

@ObjectType()
export class GuildMember implements GuildMember {
	@Field(() => ID)
	public userID!: string;

	@Field()
	public displayName!: string;

	@Field(() => Int)
	public joinedTimestamp!: number;

	@Field(() => [Role], { nullable: true })
	public roles?: Role[];

	@Field()
	public guildID!: string;
}

@Resolver(() => GuildMember)
export class GuildMemberResolver implements ResolverInterface<GuildMember> {
	@FieldResolver()
	public async roles(
		@Root() member: GuildMember,
		@Ctx() context: Context
	): Promise<Role[] | undefined> {
		const promises = (member.roles as unknown as string[]).map((r: string) => context.node.sendTo('bot', { type: 'ROLE', guildId: member.guildID, id: r }));
		const resolved = await Promise.all(promises);
		return resolved.map(({ d }: { d: Role }) => d);
	}
}
