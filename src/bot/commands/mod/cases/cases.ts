import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class CasesCommand extends Command {
	public constructor() {
		super('cases', {
			aliases: ['cases'],
			description: {
				content: MESSAGES.COMMANDS.MOD.CASES.DESCRIPTION,
				usage: '<method> <...arguments>',
			},
			category: 'mod',
			channel: 'guild',
			ratelimit: 2,
		});
	}

	// @ts-ignore
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public *args() {
		const method = yield {
			type: [['case-show', 'case', 'show', 'view'], ['case-delete', 'delete', 'del', 'remove', 'rm']],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.MOD.CASES.REPLY(prefix);
			},
		};

		return Flag.continue(method);
	}
}
