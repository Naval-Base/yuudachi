const { Command } = require('discord-akairo');

class DeleteCasesCommand extends Command {
	constructor() {
		super('del-cases', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes the case number of the guild.'
			}
		});
	}

	async exec(message) {
		this.client.settings.delete(message.guild, 'caseTotal');
		return message.util.reply('deleted cases.');
	}
}

module.exports = DeleteCasesCommand;
