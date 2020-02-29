import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import { MESSAGES, PRODUCTION } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags, TagsInsertInput } from '../../util/graphQLTypes';
import { safeDump } from 'js-yaml';

export default class TagDownloadCommand extends Command {
	public constructor() {
		super('tag-download', {
			category: 'tag',
			description: {
				content: MESSAGES.COMMANDS.TAGS.DOWNLOAD.DESCRIPTION,
				usage: '[member]',
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					default: '',
				},
			],
		});
	}

	public async exec(message: Message, { member }: { member: GuildMember }) {
		const guild = message.guild!;
		const where = member ? { user: member.id, guild: guild.id } : { guild: guild.id };
		const { data } = await graphQLClient.query<any, TagsInsertInput>({
			query: member ? GRAPHQL.QUERY.TAGS_MEMBER : GRAPHQL.QUERY.TAGS,
			variables: where,
		});
		let tags: Pick<
			Tags,
			'aliases' | 'content' | 'createdAt' | 'hoisted' | 'name' | 'templated' | 'updatedAt' | 'user'
		>[];
		if (PRODUCTION) tags = data.tags;
		else tags = data.tagsStaging;
		if (!tags.length) return;
		return message.util?.send(MESSAGES.COMMANDS.TAGS.DOWNLOAD.REPLY, {
			files: [
				{
					attachment: Buffer.from(safeDump(tags), 'utf8'),
					name: `${member ? `${member.displayName}s_tags` : 'all_tags'}.yaml`,
				},
			],
		});
	}
}
