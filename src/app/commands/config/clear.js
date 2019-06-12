const { Command } = require('discord-akairo');

class ClearConfigCommand extends Command {
	constructor() {
		super('config-clear', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Clears the guild config.'
			},
			args: [
				{
					id: 'confirm',
					match: 'none',
					type: (msg, phrase) => {
						if (!phrase) return null;
						if (/^y(?:e(?:a|s)?)?$/i.test(phrase)) return true;
						return null;
					},
					prompt: {
						modifyStart: () => {
							const content = 'You sure you want me to clear all settings? (Y/N)';
							return { content };
						},
						time: 10000,
						retries: 0,
						ended: message => `${message.author}, command has been cancelled.`
					}
				}
			]
		});
	}

	async exec(message) {
		this.client.settings.clear(message.guild);
		return message.util.reply('cleared the guild configuration.');
	}
}

module.exports = ClearConfigCommand;
