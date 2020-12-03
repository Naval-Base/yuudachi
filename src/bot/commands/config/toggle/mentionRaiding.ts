import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class ToggleMentionRaidingCommand extends Command {
	public constructor() {
		super('config-toggle-mention-raiding', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.MENTION_RAIDING.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const mentionRaiding = this.client.settings.get(message.guild!, SETTINGS.MENTION_RAIDING);
		if (mentionRaiding) {
			this.client.settings.set(message.guild!, SETTINGS.MENTION_RAIDING, false);
			return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.MENTION_RAIDING.REPLY_DEACTIVATED);
		}
		this.client.settings.set(message.guild!, SETTINGS.MENTION_RAIDING, true);

		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.MENTION_RAIDING.REPLY_ACTIVATED);
	}
}
