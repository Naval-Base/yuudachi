import { Resolver, Query, Ctx, Arg, FieldResolver, Root, Int, Mutation, InputType, Field } from 'type-graphql';
import { Context } from '../../';
import { Tag } from '../../models/Tags';
import { IPCUser } from './User';
import { IPCGuild } from './Guild';
import { Setting } from '../../models/Settings';
import { GuildMember } from './GuildMember';

export interface FindOption {
	guild?: string;
	user?: string;
}

@InputType()
class EditTagInput implements Partial<Tag> {
	@Field({ nullable: true })
	public name?: string;

	@Field(() => [String], { nullable: true })
	public aliases?: string[];

	@Field({ nullable: true })
	public content?: string;

	@Field({ nullable: true })
	public hoisted?: boolean;
}

@Resolver(() => Tag)
export class TagResolver {
	@Query(() => Tag, { nullable: true })
	public async tag(
		@Ctx() context: Context,
		@Arg('id', () => Int) id: number
	) {
		if (!context.req.user) return undefined;
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
	) {
		if (!context.req.user) return undefined;
		const tags = context.db.getRepository(Tag);
		const where: FindOption = {};
		if (guild_id) where.guild = guild_id;
		if (user_id) where.user = user_id;
		const dbTags = await tags.find(where);
		if (!dbTags) return undefined;
		return dbTags;
	}

	@Mutation(() => Tag)
	public async editTag(
		@Ctx() context: Context,
		@Arg('id', () => Int) id: number,
		@Arg('guild_id') guild_id: string,
		@Arg('data') data: EditTagInput
	) {
		if (!context.req.user) return undefined;
		const settings = context.db.getRepository(Setting);
		const dbSettings = await settings.findOne(guild_id);
		if (!dbSettings!.settings.moderation) return undefined;
		if (!dbSettings!.settings.modRole) return undefined;
		const { success, d }: { success: boolean; d: GuildMember } = await context.node.sendTo('bot', { type: 'GUILD_MEMBER', id: context.req.user.id, guildId: guild_id });
		if (!success) return undefined;
		if (!d.roles!.includes(dbSettings!.settings.modRole)) return undefined;

		const tags = context.db.getRepository(Tag);
		if (!data || (
			!data.name &&
			!data.aliases &&
			!data.content &&
			!data.hoisted
		)) return undefined;
		const dbTag = await tags.findOne(id);
		if (!dbTag) return undefined;
		if (data.name) dbTag.name = data.name;
		if (data.aliases && data.aliases.length && Array.isArray(data.aliases)) dbTag.aliases.concat(data.aliases);
		if (data.content) dbTag.content = data.content;
		if (data.hoisted) dbTag.hoisted = data.hoisted;
		dbTag.last_modified = context.req.user.id;
		const newTag = await tags.save(dbTag);
		return newTag;
	}

	@FieldResolver()
	public async user(
		@Root() tag: Tag,
		@Ctx() context: Context
	) {
		const { success, d }: { success: boolean; d: any } = await context.node.sendTo('bot', { type: 'USER', id: tag.user });
		if (!success) return undefined;
		return d;
	}

	@FieldResolver()
	public async guild(
		@Root() tag: Tag,
		@Ctx() context: Context
	) {
		const { success, d }: { success: boolean; d: any } = await context.node.sendTo('bot', { type: 'GUILD', id: tag.guild });
		if (!success) return undefined;
		return d;
	}

	@FieldResolver()
	public async last_modified(
		@Root() tag: Tag,
		@Ctx() context: Context
	) {
		const { success, d }: { success: boolean; d: any } = await context.node.sendTo('bot', { type: 'USER', id: tag.last_modified });
		if (!success) return undefined;
		return d;
	}
}
