import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class ToggletokenFilteringCommand extends Command {
	public constructor() {
		super('config-toggle-token-filtering', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.TOKEN_FILTER.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guild = message.guild!;
		const tokenFiltering = this.client.settings.get(guild, SETTINGS.TOKEN_FILTER);
		if (tokenFiltering) {
			this.client.settings.set(guild, SETTINGS.TOKEN_FILTER, false);
			return message.util?.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.TOKEN_FILTER.REPLY_DEACTIVATED);
		}
		this.client.settings.set(guild, SETTINGS.TOKEN_FILTER, true);

		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.TOKEN_FILTER.REPLY_ACTIVATED);
	}
}
