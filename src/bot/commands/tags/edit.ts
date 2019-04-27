import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import * as moment from 'moment';
import { Tag } from '../../models/Tags';

export default class TagEditCommand extends Command {
	public constructor() {
		super('tag-edit', {
			category: 'tags',
			description: {
				content: 'Edit a tag (Markdown can be used).',
				usage: '<tag> [--hoist/--unhoist/--pin/--unpin] <content>',
				examples: ['Test Some new content', '"Test 1" Some more new content', 'Test --hoist', '"Test 1" --unpin']
			},
			channel: 'guild',
			ratelimit: 2,
			flags: ['--hoist', '--pin', '--unhoist', '--unpin']
		});
	}

	public *args(): object {
		const tag = yield {
			type: 'tag',
			prompt: {
				start: (message: Message): string => `${message.author}, what tag do you want to edit?`,
				retry: (message: Message, { failure }: { failure: { value: string } }): string => `${message.author}, a tag with the name **${failure.value}** does not exist.`
			}
		};

		const hoist = yield {
			match: 'flag',
			flag: ['--hoist', '--pin']
		};

		const unhoist = yield {
			match: 'flag',
			flag: ['--unhoist', '--unpin']
		};

		const content = yield (
			hoist || unhoist
				? {
					match: 'rest',
					type: 'tagContent'
				}
				: {
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: (message: Message): string => `${message.author}, what should the new content be?`
					}
				}
		);

		return { tag, hoist, unhoist, content };
	}

	public async exec(message: Message, { tag, hoist, unhoist, content }: { tag: Tag; hoist: boolean; unhoist: boolean; content: string | { type: string; value: string } }): Promise<Message | Message[]> {
		const staffRole = message.member!.roles.has(this.client.settings.get(message.guild!, 'modRole', undefined));
		if (tag.user !== message.author!.id && !staffRole) {
			return message.util!.reply('Losers are only allowed to edit their own tags! Hah hah hah!');
		}
		if (content && (content as string).length >= 1950) {
			return message.util!.reply('you must still have water behind your ears to not realize that messages have a limit of 2000 characters!');
		}
		const tagRepo = this.client.db.getRepository(Tag);
		if (hoist) hoist = true;
		else if (unhoist) hoist = false;
		if ((hoist || unhoist) && staffRole) tag.hoisted = hoist;
		if (content || (content as any).type !== 'fail') {
			content = Util.cleanContent((content as string), message);
			tag.content = content;
		}
		tag.last_modified = message.author!.id;
		tag.updatedAt = moment.utc().toDate();
		await tagRepo.save(tag);

		return message.util!.reply(`successfully edited **${tag.name}**${hoist && staffRole ? ' to be hoisted.' : '.'}`);
	}
}
