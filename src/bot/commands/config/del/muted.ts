import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteConfigMuteRoleCommand extends Command {
	public constructor() {
		super('config-del-muted', {
			description: {
				content: 'Deletes the mute role of the guild.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message) {
		this.client.settings.delete(message.guild!, 'muteRole');
		return message.util!.reply('deleted mute role.');
	}
}
