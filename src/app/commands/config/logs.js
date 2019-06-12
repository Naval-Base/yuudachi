const { Command } = require('discord-akairo');

class ToggleLogsCommand extends Command {
	constructor() {
		super('toggle-logs', {
			category: 'config',
			channel: 'guild',
			clientPermissions: ['MANAGE_WEBHOOKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Toggle guild-logs on the server.'
			},
			args: [
				{
					id: 'id',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'what webhook should send the messages?'
					}
				}
			]
		});
	}

	async exec(message, { id }) {
		const guildLog = this.client.settings.get(message.guild, 'guildLog', undefined);
		if (guildLog) {
			this.client.settings.delete(message.guild, 'guildLog');
			this.client.webhooks.delete(id);
			return message.util.reply('successfully deactivated guild-log!');
		}
		this.client.settings.set(message.guild, 'guildLog', id);
		const webhook = (await message.guild.fetchWebhooks()).get(id);
		if (!webhook) return message.util.reply('this is not a valid webhook!');
		this.client.webhooks.set(webhook.id, webhook);

		return message.util.reply('successfully activated guild-log!');
	}
}

module.exports = ToggleLogsCommand;
