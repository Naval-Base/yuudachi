import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../../util/constants';

export default class ToggleCommand extends Command {
	public constructor() {
		super('toggle', {
			aliases: ['toggle'],
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.DESCRIPTION,
				usage: '<method> <...arguments>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
		});
	}

	public *args(): object {
		const method = yield {
			type: [
				['toggle-logs', 'logs'],
				['toggle-moderation', 'mod', 'moderation'],
				['toggle-role-state', 'role', 'rolestate', 'role-state'],
				['toggle-token-filtering', 'tokenfilter', 'tokenfiltering', 'token'],
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.CONFIG.TOGGLE.REPLY(prefix);
			},
		};

		return Flag.continue(method);
	}
}
