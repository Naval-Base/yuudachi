import { ObjectType, Field, ID, Int, createUnionType } from 'type-graphql';

interface Channel {
	type: string;
	id: string;
	name: string;
	rawPosition: number;
	parentID: string | null;
	guild: string;
	createdTimestamp: number;
}

interface CategoryChannel extends Channel {}

interface TextChannel {
	topic: string | null;
	nsfw: boolean;
	rateLimitPerUser: number;
}

interface NewsChannel extends TextChannel {}

interface VoiceChannel extends Channel {
	bitrate: number;
	userLimit: number;
}

@ObjectType()
class Channel implements Channel {
	@Field(() => String)
	public type!: string;

	@Field(() => ID)
	public id!: string;

	@Field(() => String)
	public name!: string;

	@Field(() => Int)
	public rawPosition!: number;

	@Field(() => String, { nullable: true })
	public parentID!: string | null;

	@Field(() => String)
	public guild!: string;

	@Field(() => Int)
	public createdTimestamp!: number;
}

@ObjectType()
class CategoryChannel extends Channel implements CategoryChannel {}

@ObjectType()
class TextChannel extends Channel implements TextChannel {
	@Field(() => String, { nullable: true })
	public topic!: string | null;

	@Field(() => Boolean)
	public nsfw!: boolean;

	@Field(() => Int)
	public rateLimitPerUser!: number;
}

@ObjectType()
class NewsChannel extends TextChannel implements NewsChannel {}

@ObjectType()
class VoiceChannel extends Channel implements VoiceChannel {
	@Field(() => Int)
	public bitrate!: number;

	@Field(() => Int)
	public userLimit!: number;
}

export const channelUnion = createUnionType({
	name: 'channelUnion',
	types: [CategoryChannel, TextChannel, NewsChannel, VoiceChannel],
	resolveType: val => {
		if (val.type === 'text') return TextChannel;
		if (val.type === 'news') return NewsChannel;
		if (val.type === 'voice') return VoiceChannel;
		if (val.type === 'category') return CategoryChannel;
		return undefined;
	}
});
