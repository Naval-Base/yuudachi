import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigGitHubRepositoryCommand extends Command {
	public constructor() {
		super('config-set-repo', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.REPO.DESCRIPTION,
				usage: '<repo>',
				examples: ['1Computer1/discord-akairo', 'discordjs/discord.js'],
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'repository',
					type: 'string',
				},
			],
		});
	}

	public async exec(message: Message, { repository }: { repository: string }) {
		this.client.settings.set(message.guild!, SETTINGS.GITHUB_REPO, repository);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.REPO.REPLY(repository));
	}
}
