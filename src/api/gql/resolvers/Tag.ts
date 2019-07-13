import { Resolver, Query, Ctx, Arg, FieldResolver, Root, Int } from 'type-graphql';
import { Context } from '../../';
import { Tag } from '../../models/Tags';
import { IPCUser } from './User';
import { IPCGuild } from './Guild';

export interface FindOption {
	guild?: string;
	user?: string;
}

@Resolver(() => Tag)
export class TagResolver {
	@Query(() => Tag, { nullable: true })
	public async tag(
		@Ctx() context: Context,
		@Arg('id', () => Int) id: number
	): Promise<Tag | undefined> {
		if (!context.req.user) {
			return undefined;
		}
		const tags = context.db.getRepository(Tag);
		const dbTag = await tags.findOne(id);
		if (!dbTag) return undefined;
		return dbTag;
	}

	@Query(() => [Tag], { nullable: true })
	public async tags(
		@Ctx() context: Context,
		@Arg('guild_id', { nullable: true }) guild_id?: string,
		@Arg('user_id', { nullable: true }) user_id?: string
	): Promise<Tag[] | undefined> {
		if (!context.req.user) {
			return undefined;
		}
		const tags = context.db.getRepository(Tag);
		const where: FindOption = {};
		if (guild_id) where.guild = guild_id;
		if (user_id) where.user = user_id;
		const dbTags = await tags.find(where);
		if (!dbTags) return undefined;
		return dbTags;
	}

	@FieldResolver()
	public async user(
		@Root() tag: Tag,
		@Ctx() context: Context
	): Promise<IPCUser | undefined> {
		const { success, d }: { success: boolean; d: any } = await context.node.send({ type: 'USER', id: tag.user });
		if (!success) return undefined;
		return d;
	}

	@FieldResolver()
	public async guild(
		@Root() tag: Tag,
		@Ctx() context: Context
	): Promise<IPCGuild | undefined> {
		const { success, d }: { success: boolean; d: any } = await context.node.send({ type: 'GUILD', id: tag.guild });
		if (!success) return undefined;
		return d;
	}

	@FieldResolver()
	public async last_modified(
		@Root() tag: Tag,
		@Ctx() context: Context
	): Promise<IPCUser | undefined> {
		const { success, d }: { success: boolean; d: any } = await context.node.send({ type: 'USER', id: tag.last_modified });
		if (!success) return undefined;
		return d;
	}
}
