import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigCasesCommand extends Command {
	public constructor() {
		super('config-set-cases', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.CASES.DESCRIPTION,
				usage: '<cases>',
				examples: ['5'],
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'cases',
					match: 'content',
					type: 'integer',
				},
			],
		});
	}

	public async exec(message: Message, { cases }: { cases: number }) {
		this.client.settings.set(message.guild!, SETTINGS.CASES, cases);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.CASES.REPLY(cases));
	}
}
