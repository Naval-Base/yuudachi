const { Command } = require('discord-akairo');

class BlacklistCommand extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['block', 'unblock'],
			category: 'owner',
			ownerOnly: true,
			description: {
				content: 'Prohibit or allow a user from using the Bot.',
				usage: '<user>',
				examples: ['444432489818357760']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'who would you like to blacklist or unblacklist?'
					}
				}
			]
		});
	}

	exec(message, { user }) {
		const blacklist = this.client.settings.get('global', 'blacklist', []);
		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			if (blacklist.length === 0) this.client.settings.delete('global', 'blacklist');
			else this.client.settings.set('global', 'blacklist', blacklist);

			return message.util.send(`${user.tag}, has been removed from the ${this.client.user.username}'s blacklist.`);
		}
		blacklist.push(user.id);
		this.client.settings.set('global', 'blacklist', blacklist);

		return message.util.send(`${user.tag}, has been blacklisted from using ${this.client.user.username}'s command.`);
	}
}

module.exports = BlacklistCommand;
