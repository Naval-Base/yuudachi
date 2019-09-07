import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SetConfigGitHubRepositoryCommand extends Command {
	public constructor() {
		super('config-set-repo', {
			description: {
				content: 'Sets the repository the GitHub commands use.',
				usage: '<repo>',
				examples: ['1Computer1/discord-akairo', 'discordjs/discord.js']
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'repository',
					type: 'string'
				}
			]
		});
	}

	public async exec(message: Message, { repository }: { repository: string }) {
		this.client.settings.set(message.guild!, 'githubRepository', repository);
		return message.util!.reply(`set repository to **${repository}**`);
	}
}
