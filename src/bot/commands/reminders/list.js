const { Command } = require('discord-akairo');
const Util = require('../../util/Util');

class ReminderListCommand extends Command {
	constructor() {
		super('reminder-list', {
			aliases: ['reminders'],
			category: 'reminders',
			description: {
				content: 'Lists all of your ongoing reminders.'
			},
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2
		});
	}

	async exec(message) {
		const reminders = await this.client.db.models.reminders.findAll({ where: { user: message.author.id } });

		return message.util.send(Util.generateRemindersEmbed(message, reminders));
	}
}

module.exports = ReminderListCommand;
