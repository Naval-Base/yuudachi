const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const diff = require('diff');

class MessageUpdateListener extends Listener {
	constructor() {
		super('messageUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: 'client'
		});
	}

	exec(oldMessage, newMessage) {
		const guildLogs = this.client.settings.get(newMessage.guild, 'guildLogs');
		if (guildLogs) {
			const embed = new MessageEmbed()
				.setColor(0x306bff)
				.setAuthor(`${newMessage.author.tag} (${newMessage.author.id})`, newMessage.author.displayAvatarURL())
				.addField('❯ Channel', newMessage.channel);
			let msg = '';
			if (/```(.*?)```/s.test(oldMessage)) {
				const diffMessage = diff.diffLines(oldMessage.content, newMessage.content, { newlineIsToken: true });
				for (const part of diffMessage) {
					if (part.value === '\n') continue;
					const d = part.added ? '+ ' : part.removed ? '- ' : '';
					msg += `${d}${part.value.replace(/\n/g, '')}\n`;
				}
				const prepend = '```diff\n';
				const append = '\n```';
				embed.addField('❯ Message', `${prepend}${msg.match(/```(?:(\S+)\n)?\s*([^]+?)\s*```/)[2].substring(0, 1000)}\n...${append}`);
			} else {
				const diffMessage = diff.diffWords(oldMessage.content, newMessage.content);
				for (const part of diffMessage) {
					const markdown = part.added ? '**' : part.removed ? '~~' : '';
					msg += `${markdown}${part.value}${markdown}`;
				}
				embed.addField('❯ Message', `${msg.substring(0, 1020)}...`);
			}
			embed.addField('❯ Jump To', newMessage.url, true);
			embed.setTimestamp(newMessage.editedAt);
			embed.setFooter('Edited');

			return this.client.webhook.send({
				embeds: [embed],
				username: 'Logs: MESSAGE UPDATED',
				avatarURL: 'https://i.imgur.com/wnC4KmC.png'
			});
		}
	}
}

module.exports = MessageUpdateListener;
