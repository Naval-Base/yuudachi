import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES } from '../../util/constants';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			description: {
				content: MESSAGES.COMMANDS.UTIL.PREFIX.DESCRIPTION,
				usage: '[prefix]',
				examples: ['*', 'Yukikaze'],
			},
			category: 'util',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'prefix',
					type: 'string',
				},
			],
		});
	}

	public async exec(message: Message, { prefix }: { prefix: string }) {
		if (!prefix) {
			return message.util!.send(MESSAGES.COMMANDS.UTIL.PREFIX.REPLY((this.handler.prefix as PrefixSupplier)(message)));
		}
		this.client.settings.set(message.guild!, 'prefix', prefix);
		if (prefix === process.env.COMMAND_PREFIX) {
			return message.util!.reply(MESSAGES.COMMANDS.UTIL.PREFIX.REPLY_2(prefix));
		}
		return message.util!.reply(MESSAGES.COMMANDS.UTIL.PREFIX.REPLY_3(prefix));
	}
}
