import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import { MESSAGES, PRODUCTION } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags, TagsInsertInput } from '../../util/graphQLTypes';

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
		let tags: Pick<Tags, 'content' | 'name' | 'hoisted' | 'user' | 'templated'>[];
		if (PRODUCTION) tags = data.tags;
		else tags = data.tagsStaging;
		if (!tags.length) return;
		const output = tags.reduce((out, t) => {
			out += `Name: ${t.name}${t.templated ? ' [TEMPLATED]' : ''}\r\nUser: ${t.user}\r\nContent:\r\n${t.content.replace(
				/\n/g,
				'\r\n',
			)}\r\n\r\n========================================\r\n\r\n`;
			return out;
		}, '');

		return message.util?.send(MESSAGES.COMMANDS.TAGS.DOWNLOAD.REPLY, {
			files: [
				{ attachment: Buffer.from(output, 'utf8'), name: `${member ? `${member.displayName}s_tags` : 'all_tags'}.txt` },
			],
		});
	}
}
