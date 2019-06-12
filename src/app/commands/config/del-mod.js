const { Command } = require('discord-akairo');

class DeleteModRoleCommand extends Command {
	constructor() {
		super('del-mod', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes the mod role.'
			}
		});
	}

	async exec(message) {
		this.client.settings.delete(message.guild, 'modRole');
		return message.util.reply('deleted moderation role.');
	}
}

module.exports = DeleteModRoleCommand;
