const { Command, Argument } = require('discord-akairo');

class ClearCommand extends Command {
	constructor() {
		super('clear', {
			aliases: ['clear', 'purge'],
			category: 'mod',
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'amount',
					type: Argument.range('integer', 0, 100, true),
					prompt: {
						retry: 'the minimum number is **1** and the maximum is **100**.'
					},
					default: 0
				},
				{
					id: 'user',
					type: 'user',
					prompt: {
						retry: 'please specify a valid ClientUser...',
						optional: true
					}
				}
			],
			description: {
				content: 'Purgs messages upto 100.',
				usage: '<amount> [user]',
				examples: ['10', '10 @Suvajit']
			}
		});
	}

	exec(message, { user, amount }) {
		message.channel.messages.fetch({
			limit: 100
		}).then(messages => {
			if (user) {
				messages = messages.filter(msg => msg.author.id === user.id).array().slice(0, amount);
			} else if (!user) {
				messages = messages.array().slice(0, amount);
			}

			message.channel.bulkDelete(messages).catch(error => {
				if (error) return message.util.reply('you can only bulk delete messages that are under 14 days old.');
			});
		});
	}
}

module.exports = ClearCommand;
