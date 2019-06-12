const { Command } = require('discord-akairo');

class DeleteRestrictRolesCommand extends Command {
	constructor() {
		super('del-restrict', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes the restriction roles of the guild.'
			}
		});
	}

	exec(message) {
		this.client.settings.delete(message.guild, 'restrictRoles');
		return message.util.reply('deleted restricted roles.');
	}
}

module.exports = DeleteRestrictRolesCommand;
