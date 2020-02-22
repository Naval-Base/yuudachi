import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES } from '../../../util/constants';

export default class CasesCommand extends Command {
	public constructor() {
		super('cases', {
			aliases: ['cases'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.CASES.DESCRIPTION,
				usage: '<method> <...arguments>',
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
		});
	}

	public *args() {
		const method = yield {
			type: [
				['case-show', 'case', 'show', 'view'],
				['case-delete', 'delete', 'del', 'remove', 'rm'],
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.MOD.CASES.REPLY(prefix);
			},
		};

		return Flag.continue(method);
	}
}
