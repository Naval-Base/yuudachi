const { Command } = require('discord-akairo');

class SetCasesCommand extends Command {
	constructor() {
		super('set-cases', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets the case number of the guild.',
				usage: '<cases>',
				examples: ['5']
			},
			args: [
				{
					id: 'cases',
					match: 'content',
					type: 'integer'
				}
			]
		});
	}

	exec(message, { cases }) {
		if (!cases) return;
		this.client.settings.set(message.guild, 'caseTotal', cases);
		return message.util.reply(`set cases to **${cases}**`);
	}
}

module.exports = SetCasesCommand;
