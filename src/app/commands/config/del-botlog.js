const { Command } = require('discord-akairo');

class DeleteClientLogCommand extends Command {
	constructor() {
		super('del-botlog', {
			category: 'config',
			channel: 'guild',
			clientPermissions: ['MANAGE_WEBHOOKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deleted the client log channel.'
			}
		});
	}

	async exec(message) {
		this.client.settings.delete('global', 'clientLog');
		return message.util.reply('successfully deleted client-log!');
	}
}

module.exports = DeleteClientLogCommand;
