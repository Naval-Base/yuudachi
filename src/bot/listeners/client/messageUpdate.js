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
		if (oldMessage.author.bot || newMessage.author.bot) return;
		const guildLogs = this.client.settings.get(newMessage.guild, 'guildLogs');
		if (guildLogs || newMessage.guild.id === '424963290989461514') {
			const embed = new MessageEmbed()
				.setColor(0x306bff)
				.setAuthor(`${newMessage.author.tag} (${newMessage.author.id})`, newMessage.author.displayAvatarURL())
				.addField('❯ Channel', newMessage.channel);
			let msg = '';
			if (/```(.*?)```/s.test(oldMessage)) {
				const strippedOldMessage = oldMessage.content.match(/```(?:(\S+)\n)?\s*([^]+?)\s*```/)[2];
				const strippedNewMessage = newMessage.content.match(/```(?:(\S+)\n)?\s*([^]+?)\s*```/)[2];
				if (strippedOldMessage === strippedNewMessage) return;
				const diffMessage = diff.diffLines(strippedOldMessage, strippedNewMessage, { newlineIsToken: true });
				for (const part of diffMessage) {
					if (part.value === '\n') continue;
					const d = part.added ? '+ ' : part.removed ? '- ' : '';
					msg += `${d}${part.value.replace(/\n/g, '')}\n`;
				}
				const prepend = '```diff\n';
				const append = '\n```';
				embed.addField('❯ Message', `${prepend}${msg.substring(0, 1000)}${append}`);
			} else {
				const diffMessage = diff.diffWords(oldMessage.content, newMessage.content);
				for (const part of diffMessage) {
					const markdown = part.added ? '**' : part.removed ? '~~' : '';
					msg += `${markdown}${part.value}${markdown}`;
				}
				embed.addField('❯ Message', `${msg.substring(0, 1020)}` || '\u200b');
			}
			embed.addField('❯ Jump To', newMessage.url, true);
			embed.setTimestamp(newMessage.editedAt || oldMessage.editedAt);
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
