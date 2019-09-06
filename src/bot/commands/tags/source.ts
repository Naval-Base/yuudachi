import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Tag } from '../../models/Tags';

export default class TagSourceCommand extends Command {
	public constructor() {
		super('tag-source', {
			category: 'tags',
			description: {
				content: 'Displays a tags source (Highlighted with Markdown).',
				usage: '[--file/-f] <tag>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'file',
					match: 'flag',
					flag: ['--file', '-f']
				},
				{
					id: 'tag',
					match: 'rest',
					type: 'tag',
					prompt: {
						start: (message: Message) => `${message.author}, what tag would you like to see the source of?`,
						retry: (message: Message, { failure }: { failure: { value: string } }) => `${message.author}, a tag with the name **${failure.value}** does not exist.`
					}
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const restrictedRoles = this.client.settings.get<{ tag: string }>(message.guild!, 'restrictedRoles', undefined);
		if (!restrictedRoles) return null;
		const hasRestrictedRole = message.member!.roles.has(restrictedRoles.tag);
		if (hasRestrictedRole) return 'Restricted';
		return null;
	}

	public async exec(message: Message, { tag, file }: { tag: Tag; file: boolean }) {
		return message.util!.send(tag.content, {
			code: 'md',
			files: file
				? [{
					attachment: Buffer.from(tag.content.replace(/\n/g, '\r\n'), 'utf8'),
					name: `${tag.name}_source.txt`
				}]
				: undefined
		});
	}
}
