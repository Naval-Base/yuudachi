import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { Tag } from '../../models/Tags';

export default class TagShowCommand extends Command {
	public constructor() {
		super('tag-show', {
			category: 'tags',
			description: {
				content: 'Displays a tag.',
				usage: '<tag>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					match: 'content',
					type: 'lowercase',
					prompt: {
						start: (message: Message): string => `${message.author}, what tag would you like to see?`
					}
				}
			]
		});
	}

	public async exec(message: Message, { name }: { name: string }): Promise<Message | Message[] | void> {
		if (!name) return;
		const restrictedRoles = this.client.settings.get(message.guild!, 'restrictedRoles', undefined);
		if (restrictedRoles) {
			if (message.member!.roles.has(restrictedRoles.tag)) return;
		}
		name = Util.cleanContent(name, message);
		const tagsRepo = this.client.db.getRepository(Tag);
		const dbTags = await tagsRepo.find({ guild: message.guild!.id });
		const [tag] = dbTags.filter((t): boolean => t.name === name || t.aliases.includes(name));
		if (!tag) return;
		tag.uses += 1;
		await tagsRepo.save(tag);

		return message.util!.send(tag.content);
	}
}
