import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import { Tag } from '../../models/Tags';
import { MESSAGES, SETTINGS } from '../../util/constants';

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
		const restrictedRoles = this.client.settings.get<{ tag: string }>(
			message.guild!,
			SETTINGS.RESTRICT_ROLES,
			undefined,
		);
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
