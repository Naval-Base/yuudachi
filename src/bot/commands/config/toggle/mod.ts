import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class ToggleModerationCommand extends Command {
	public constructor() {
		super('config-toggle-moderation', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.MOD.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guild = message.guild!;
		const moderation = this.client.settings.get(guild, SETTINGS.MODERATION);
		if (moderation) {
			this.client.settings.set(guild, SETTINGS.MODERATION, false);
			return message.util?.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.MOD.REPLY_DEACTIVATED);
		}
		this.client.settings.set(guild, SETTINGS.MODERATION, true);

		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.MOD.REPLY_ACTIVATED);
	}
}
