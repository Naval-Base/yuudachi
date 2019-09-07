import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteConfigModChannelCommand extends Command {
	public constructor() {
		super('config-del-modlog', {
			description: {
				content: 'Deletes the mod log.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message) {
		this.client.settings.delete(message.guild!, 'modLogChannel');
		return message.util!.reply('deleted moderation log channel.');
	}
}
