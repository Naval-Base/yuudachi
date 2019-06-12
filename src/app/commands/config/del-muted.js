const { Command } = require('discord-akairo');

class DeleteMuteRoleCommand extends Command {
	constructor() {
		super('del-muted', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes the mute role of the guild.'
			}
		});
	}

	exec(message) {
		this.client.settings.delete(message.guild, 'muteRole');
		return message.util.reply('deleted mute role.');
	}
}

module.exports = DeleteMuteRoleCommand;
