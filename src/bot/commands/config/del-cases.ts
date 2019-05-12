import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteConfigCasesCommand extends Command {
	public constructor() {
		super('config-del-cases', {
			description: {
				content: 'Deletes the case number of the guild.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		this.client.settings.delete(message.guild!, 'caseTotal');
		return message.util!.reply('deleted cases.');
	}
}
