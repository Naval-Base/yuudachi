const { Command } = require('discord-akairo');

class ToggleLogsCommand extends Command {
	constructor() {
		super('toggle-logs', {
			aliases: ['logs', 'toggle-logs'],
			description: {
				content: 'Toggle logs on the server.'
			},
			category: 'config',
			channel: 'guild',
			ownerOnly: true,
			ratelimit: 2
		});
	}

	exec(message) {
		const guildLogs = this.client.settings.get(message.guild, 'guildLogs');
		if (guildLogs) {
			this.client.settings.set(message.guild, 'guildLogs', false);
			return message.util.reply('successfully deactivated logs!');
		}
		this.client.settings.set(message.guild, 'guildLogs', true);

		return message.util.reply('successfully activated logs!');
	}
}

module.exports = ToggleLogsCommand;
