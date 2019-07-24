import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ToggletokenFilteringCommand extends Command {
	public constructor() {
		super('toggle-token-filtering', {
			description: {
				content: 'Toggle token filtering feature on the server.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const tokenFiltering = this.client.settings.get(message.guild!, 'tokenFiltering', undefined);
		if (tokenFiltering) {
			this.client.settings.set(message.guild!, 'tokenFiltering', false);
			return message.util!.reply('disabled token filtering commands!');
		}
		this.client.settings.set(message.guild!, 'tokenFiltering', true);

		return message.util!.reply('activated token filtering commands!');
	}
}
