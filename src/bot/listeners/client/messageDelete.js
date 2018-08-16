const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class MessageDeleteListener extends Listener {
	constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'client'
		});
	}

	exec(message) {
		if (message.author.bot) return;
		const guildLogs = this.client.settings.get(message.guild, 'guildLogs');
		if (guildLogs) {
			const attachment = message.attachments.first();
			const embed = new MessageEmbed()
				.setColor(0x824aee)
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.addField('❯ Channel', message.channel)
				.addField('❯ Message', `${message.content.substring(0, 1020)}`);
			if (attachment) embed.addField('❯ Attachment(s)', attachment.url);
			embed.setTimestamp(new Date());
			embed.setFooter('Deleted');

			return this.client.webhook.send({
				embeds: [embed],
				username: 'Logs: MESSAGE DELETED',
				avatarURL: 'https://i.imgur.com/EUGvQJJ.png'
			});
		}
	}
}

module.exports = MessageDeleteListener;
