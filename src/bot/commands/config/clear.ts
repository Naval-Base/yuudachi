import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ClearConfigCommand extends Command {
	public constructor() {
		super('config-clear', {
			description: {
				content: 'Clears the guild config.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		this.client.settings.clear(message.guild!);
		return message.util!.reply('cleared the guild config.');
	}
}
