import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ToggleMentionRaidingCommand extends Command {
	public constructor() {
		super('toggle-mention-raiding', {
			description: {
				content: 'Toggle mention raid blocking on the server.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const mentionRaiding = this.client.settings.get(message.guild!, 'mentionRaiding', undefined);
		if (mentionRaiding) {
			this.client.settings.set(message.guild!, 'mentionRaiding', false);
			return message.util!.reply('disabled mention raid blocking!');
		}
		this.client.settings.set(message.guild!, 'mentionRaiding', true);

		return message.util!.reply('activated mention raid blocking!');
	}
}
