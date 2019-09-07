import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteConfigRestrictRolesCommand extends Command {
	public constructor() {
		super('config-del-restrict', {
			description: {
				content: 'Deletes the restriction roles of the guild.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message) {
		this.client.settings.delete(message.guild!, 'restrictRoles');
		return message.util!.reply('deleted restricted roles.');
	}
}
