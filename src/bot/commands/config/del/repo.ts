import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DeleteConfigGitHubRepositoryCommand extends Command {
	public constructor() {
		super('config-del-repo', {
			description: {
				content: 'Deletes the repository the GitHub commands use.'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public async exec(message: Message) {
		this.client.settings.delete(message.guild!, 'githubRepository');
		return message.util!.reply('deleted repository.');
	}
}
