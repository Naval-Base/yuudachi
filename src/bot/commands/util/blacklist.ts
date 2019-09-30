import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class BlacklistCommand extends Command {
	public constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			description: {
				content: MESSAGES.COMMANDS.UTIL.BLACKLIST.DESCRIPTION,
				usage: '<user>',
				examples: ['Crawl', '@Crawl', '81440962496172032'],
				ownerOnly: true,
			},
			category: 'util',
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'user',
					match: 'content',
					type: 'user',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.UTIL.BLACKLIST.PROMPT.START(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { user }: { user: User }) {
		const blacklist = this.client.settings.get('global', SETTINGS.BLACKLIST, ['']);
		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			if (blacklist.length === 0) this.client.settings.delete('global', SETTINGS.BLACKLIST);
			else this.client.settings.set('global', SETTINGS.BLACKLIST, blacklist);

			return message.util!.send(MESSAGES.COMMANDS.UTIL.BLACKLIST.REPLY(user.tag));
		}

		blacklist.push(user.id);
		this.client.settings.set('global', SETTINGS.BLACKLIST, blacklist);

		return message.util!.send(MESSAGES.COMMANDS.UTIL.BLACKLIST.REPLY_2(user.tag));
	}
}
