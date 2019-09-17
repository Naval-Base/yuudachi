import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class ToggleModerationCommand extends Command {
	public constructor() {
		super('toggle-moderation', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.MOD.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const moderation = this.client.settings.get(message.guild!, SETTINGS.MODERATION, undefined);
		if (moderation) {
			this.client.settings.set(message.guild!, SETTINGS.MODERATION, false);
			return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.MOD.REPLY_DEACTIVATED);
		}
		this.client.settings.set(message.guild!, SETTINGS.MODERATION, true);

		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.MOD.REPLY_ACTIVATED);
	}
}
