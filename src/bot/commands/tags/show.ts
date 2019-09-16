import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { Raw } from 'typeorm';
import { Tag } from '../../models/Tags';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class TagShowCommand extends Command {
	public constructor() {
		super('tag-show', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.SHOW.DESCRIPTION,
				usage: '<tag>',
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					match: 'content',
					type: 'lowercase',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.SHOW.PROMPT.START(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { name }: { name: string }) {
		if (!name) return;
		const restrictedRoles = this.client.settings.get<{ tag: string }>(
			message.guild!,
			SETTINGS.RESTRICT_ROLES,
			undefined,
		);
		if (restrictedRoles) {
			if (message.member!.roles.has(restrictedRoles.tag)) return;
		}
		name = Util.cleanContent(name, message);
		const tagsRepo = this.client.db.getRepository(Tag);
		let tag;
		try {
			tag = await tagsRepo.findOne({
				where: [
					{ name, guild: message.guild!.id },
					{ aliases: Raw(alias => `${alias} @> ARRAY['${name}']`), guild: message.guild!.id },
				],
			});
		} catch {}
		if (!tag) return;
		tag.uses += 1;
		await tagsRepo.save(tag);

		return message.util!.send(tag.content);
	}
}
