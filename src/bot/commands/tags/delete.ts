import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Tag } from '../../models/Tags';

export default class TagDeleteCommand extends Command {
	public constructor() {
		super('tag-delete', {
			category: 'tags',
			description: {
				content: 'Deletes a tag.',
				usage: '<tag>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					match: 'content',
					type: 'tag',
					prompt: {
						start: (message: Message): string => `${message.author}, what tag do you want to delete?`,
						retry: (message: Message, { failure }: { failure: { value: string } }): string => `${message.author}, a tag with the name **${failure.value}** does not exist.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { tag }: { tag: Tag }): Promise<Message | Message[]> {
		const staffRole = message.member!.roles.has(this.client.settings.get(message.guild!, 'modRole', undefined));
		if (tag.user !== message.author!.id && !staffRole) return message.util!.reply('you can only delete your own tags.');
		const tagsRepo = this.client.db.getRepository(Tag);
		await tagsRepo.remove(tag);

		return message.util!.reply(`successfully deleted **${tag.name.substring(0, 1900)}**.`);
	}
}
