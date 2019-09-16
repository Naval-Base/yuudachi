import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../util/constants';

export default class ReminderCommand extends Command {
	public constructor() {
		super('reminder', {
			aliases: ['remind', 'reminder'],
			description: {
				content: MESSAGES.COMMANDS.REMINDERS.DESCRIPTION,
				usage: '<method> <...arguments>',
				examples: ['add leave in 5 minutes', 'add --dm ban Dim in 6 months', 'delete', 'delete --all', 'list'],
			},
			category: 'reminders',
			ratelimit: 2,
		});
	}

	public *args() {
		const method = yield {
			type: [['reminder-add', 'add'], ['reminder-delete', 'delete', 'del', 'cancel'], ['reminder-list', 'list', 'ls']],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.REMINDERS.REPLY(prefix);
			},
		};

		return Flag.continue(method);
	}
}
