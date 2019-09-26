import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES } from '../../../../util/constants';

export default class SetConfigRestrictRolesCommand extends Command {
	public constructor() {
		super('config-set-restrict', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.DESCRIPTION,
				usage: '<key> <...arguments>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public *args() {
		const key = yield {
			type: [
				['config-set-restrict-embed', 'embed'],
				['config-set-restrict-emoji', 'emoji'],
				['config-set-restrict-reaction', 'reaction'],
				['config-set-restrict-tag', 'tag'],
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REPLY(prefix);
			},
		};

		return Flag.continue(key);
	}
}
