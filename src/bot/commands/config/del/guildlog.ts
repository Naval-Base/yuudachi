import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class DeleteConfigGuildLogCommand extends Command {
	public constructor() {
		super('config-del-guildlog', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.DELETE.GUILD_LOG.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guildLogs = this.client.settings.get<string>(message.guild!, SETTINGS.GUILD_LOG, undefined);
		if (guildLogs) {
			this.client.settings.delete(message.guild!, SETTINGS.GUILD_LOG);
			this.client.webhooks.delete(guildLogs);
			return message.util!.reply(MESSAGES.COMMANDS.CONFIG.DELETE.GUILD_LOG.REPLY);
		}
	}
}
