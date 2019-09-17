import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class ToggleLogsCommand extends Command {
	public constructor() {
		super('config-toggle-logs', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.LOGS.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			clientPermissions: ['MANAGE_WEBHOOKS'],
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'webhook',
					match: 'content',
					type: 'string',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.TOGGLE.LOGS.PROMPT.START(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { webhook }: { webhook: string }) {
		const guildLogs = this.client.settings.get(message.guild!, SETTINGS.GUILD_LOG, undefined);
		if (guildLogs) {
			this.client.settings.delete(message.guild!, SETTINGS.GUILD_LOG);
			this.client.webhooks.delete(webhook);
			return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.LOGS.REPLY_DEACTIVATED);
		}
		this.client.settings.set(message.guild!, SETTINGS.GUILD_LOG, webhook);
		const wh = (await message.guild!.fetchWebhooks()).get(webhook);
		if (!wh) return;
		this.client.webhooks.set(wh.id, wh);

		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.LOGS.REPLY_ACTIVATED);
	}
}
