const { Listener } = require('discord-akairo');
const { MessageEmbed, WebhookClient } = require('discord.js');

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
		if (!message.content) return;
		const guildLog = this.client.settings.get(message.guild, 'guildLog', undefined);
		if (guildLog) {
			const webhook = this.client.webhooks.get(guildLog);
			if (!webhook) return;

			const attachment = message.attachments.first();
			const embed = new MessageEmbed().setColor(0x5970c1)
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.addField('Channel', message.channel)
				.setThumbnail('https://i.imgur.com/EUGvQJJ.png')
				.addField('Message', `${message.content.substring(0, 1020)}`)
				.setTimestamp(new Date());
			if (attachment) embed.addField('Attachment', attachment.url);

			return webhook.send({
				embeds: [embed],
				username: 'Message Deleted',
				avatarURL: 'https://i.imgur.com/EUGvQJJ.png'
			});
		}
	}
}

module.exports = MessageDeleteListener;
