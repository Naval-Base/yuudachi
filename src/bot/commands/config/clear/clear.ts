import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../../util/constants';

export default class ClearConfigCommand extends Command {
	public constructor() {
		super('config-clear', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.CLEAR.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		this.client.settings.clear(message.guild!);
		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.CLEAR.REPLY);
	}
}
