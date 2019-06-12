const { Command } = require('discord-akairo');

class DeleteModLogCommand extends Command {
	constructor() {
		super('del-modlog', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes the mod log.'
			}
		});
	}

	async exec(message) {
		this.client.settings.delete(message.guild, 'modLog');
		return message.util.reply('set moderation log channel.');
	}
}

module.exports = DeleteModLogCommand;
