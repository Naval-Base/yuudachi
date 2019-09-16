import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../util/constants';
export default class ConfigCommand extends Command {
	public constructor() {
		super('config', {
			aliases: ['config'],
			description: {
				content: MESSAGES.COMMANDS.CONFIG.DESCRIPTION,
				usage: '<method> <...arguments>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
		});
	}

	public *args() {
		const method = yield {
			type: [['config-set', 'set'], ['config-delete', 'delete', 'del', 'remove', 'rm'], ['config-clear', 'clear']],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.CONFIG.REPLY(prefix);
			},
		};

		return Flag.continue(method);
	}
}
