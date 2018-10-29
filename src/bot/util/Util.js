const { MessageEmbed } = require('discord.js');

class Util {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	static truncate(str, len) {
		return str.length > len ? `${str.slice(0, len)}…` : str;
	}

	static generateRemindersEmbed(message, reminders) {
		return new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setColor(0x30A9ED)
			.setDescription(reminders.length
				? reminders.sort((a, b) => a.triggers_at - b.triggers_at).map(
					(reminder, i) => `${i + 1}. ${this.truncate(reminder.reason || 'reasonless', 30)} \`${reminder.triggers_at.toUTCString()}\`${reminder.channel ? '' : ' (DM)'}`
				).join('\n')
				: 'No reminders');
	}
}

module.exports = Util;
