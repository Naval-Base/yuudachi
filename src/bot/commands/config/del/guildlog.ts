import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class DeleteConfigGuildLogCommand extends Command {
	public constructor() {
		super('config-del-guildlog', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.DELETE.GUILD_LOG.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guild = message.guild!;
		const guildLogs = this.client.settings.get(guild, SETTINGS.GUILD_LOG);
		if (guildLogs) {
			this.client.settings.delete(guild, SETTINGS.GUILD_LOG);
			this.client.webhooks.delete(guildLogs);
			return message.util?.reply(MESSAGES.COMMANDS.CONFIG.DELETE.GUILD_LOG.REPLY);
		}
	}
}
