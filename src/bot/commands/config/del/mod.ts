import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteConfigModRoleCommand extends Command {
	public constructor() {
		super('config-del-mod', {
			description: {
				content: 'Deletes the mod role.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message) {
		this.client.settings.delete(message.guild!, 'modRole');
		return message.util!.reply('deleted moderation role.');
	}
}
