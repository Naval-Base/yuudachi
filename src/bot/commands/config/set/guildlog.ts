import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigGuildLogCommand extends Command {
	public constructor() {
		super('config-set-guildlog', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.GUILD_LOG.DESCRIPTION,
				usage: '<webhook>',
			},
			category: 'config',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_WEBHOOKS],
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'webhook',
					match: 'content',
					type: 'string',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.GUILD_LOG.PROMPT.START(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { webhook }: { webhook: string }) {
		this.client.settings.set(message.guild!, SETTINGS.GUILD_LOG, webhook);
		const wh = (await message.guild!.fetchWebhooks()).get(webhook);
		if (!wh) return;
		this.client.webhooks.set(wh.id, wh);

		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.SET.GUILD_LOG.REPLY);
	}
}
