import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import { Tag } from '../../models/Tags';

export default class TagDownloadCommand extends Command {
	public constructor() {
		super('tag-download', {
			category: 'tags',
			description: {
				content: 'Downloads a/all tag(s).',
				usage: '[member]'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					'id': 'member',
					'match': 'content',
					'type': 'member',
					'default': ''
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

	public async exec(message: Message, { member }: { member: GuildMember }) {
		const where = member ? { user: member.id, guild: message.guild!.id } : { guild: message.guild!.id };
		const tagsRepo = this.client.db.getRepository(Tag);
		const tags = await tagsRepo.find(where);
		if (!tags.length) return;
		const output = tags.reduce((out, t) => {
			out += `Name: ${t.name}\r\nContent:\r\n${t.content.replace(/\n/g, '\r\n')}\r\n\r\n========================================\r\n\r\n`;
			return out;
		}, '');

		return message.util!.send('Haiiiii~', { files: [{ attachment: Buffer.from(output, 'utf8'), name: `${member ? `${member.displayName}s_tags` : 'all_tags'}.txt` }] });
	}
}
