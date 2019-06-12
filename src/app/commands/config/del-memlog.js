const { Command } = require('discord-akairo');

class DeleteMemberLogCommand extends Command {
	constructor() {
		super('del-memberlog', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes the member log channel.'
			}
		});
	}

	exec(message, { channel }) {
		if (!channel) return;
		this.client.settings.delete(message.guild, 'memberLog');
		return message.util.reply('deleted member log channel.');
	}
}

module.exports = DeleteMemberLogCommand;
