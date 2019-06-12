const { Listener } = require('discord-akairo');
const { MessageEmbed, WebhookClient } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

class MessageDeleteBulkListener extends Listener {
	constructor() {
		super('messageDeleteBulk', {
			event: 'messageDeleteBulk',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(messages) {
		const guildLog = this.client.settings.get(messages.first().guild, 'guildLog', undefined);
		if (guildLog) {
			const webhook = this.client.webhooks.get(guildLog);
			if (!webhook) return;

			const output = messages.reduce((out, msg) => {
				const attachment = msg.attachments.first();
				out += `[${moment.utc(msg.createdTimestamp).format('YYYY/MM/DD hh:mm:ss')}] ${msg.author.tag} (${msg.author.id}): ${msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''}${attachment ? `\r\n${attachment.url}` : ''}\r\n`;
				return out;
			}, '');
			const embed = new MessageEmbed()
				.setColor(0x5970c1)
				.setAuthor(`${messages.first().author.tag} (${messages.first().author.id})`, messages.first().author.displayAvatarURL())
				.addField('Logs', 'See attachment file for full logs.')
				.setTimestamp(new Date())
				.setThumbnail('https://i.imgur.com/EUGvQJJ.png');

			return webhook.send({
				embeds: [embed],
				files: [{ attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' }],
				username: 'Bulk Deleted',
				avatarURL: 'https://i.imgur.com/EUGvQJJ.png'
			});
		}
	}
}

module.exports = MessageDeleteBulkListener;
