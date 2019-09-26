import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagDownloadCommand extends Command {
	public constructor() {
		super('tag-download', {
			category: 'tags',
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

	// @ts-ignore
	public userPermissions(message: Message) {
		const restrictedRoles = this.client.settings.get<{ TAG: string }>(
			message.guild!,
			SETTINGS.RESTRICT_ROLES,
			undefined,
		);
		if (!restrictedRoles) return null;
		const hasRestrictedRole = message.member!.roles.has(restrictedRoles.TAG);
		if (hasRestrictedRole) return 'Restricted';
		return null;
	}

	public async exec(message: Message, { member }: { member: GuildMember }) {
		const where = member ? { user: member.id, guild: message.guild!.id } : { guild: message.guild!.id };
		const { data } = await graphQLClient.query({
			query: member ? GRAPHQL.QUERY.TAGS_MEMBER : GRAPHQL.QUERY.TAGS,
			variables: where,
		});
		let tags: Pick<Tags, 'content' | 'name' | 'hoisted' | 'user'>[];
		if (PRODUCTION) tags = data.tags;
		else tags = data.staging_tags;
		if (!tags.length) return;
		const output = tags.reduce((out, t) => {
			out += `Name: ${t.name}\r\nContent:\r\n${t.content.replace(
				/\n/g,
				'\r\n',
			)}\r\n\r\n========================================\r\n\r\n`;
			return out;
		}, '');

		return message.util!.send(MESSAGES.COMMANDS.TAGS.DOWNLOAD.REPLY, {
			files: [
				{ attachment: Buffer.from(output, 'utf8'), name: `${member ? `${member.displayName}s_tags` : 'all_tags'}.txt` },
			],
		});
	}
}
