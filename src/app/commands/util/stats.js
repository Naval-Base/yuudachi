const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { version } = require('../../../../package.json');

class StatsCommand extends Command {
	constructor() {
		super('stats', {
			aliases: ['stats'],
			category: 'util',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Displays statistics about the Bot.'
			}
		});
	}

	async exec(message) {
		const embed = new MessageEmbed().setColor(5861569)
			.setAuthor(`${this.client.user.username} Statistics`, this.client.user.displayAvatarURL())
			.addField('Memory Usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
			.addField('Uptime', moment.duration(this.client.uptime).format('D [days], H [hrs], m [mins], s [secs]'), true)
			.addField('Servers', this.client.guilds.size, true)
			.addField('Channels', this.client.channels.size, true)
			.addField('Users', this.client.users.size, true)
			.addField('Version', version, true)
			.addField('Source Code', '[GitHub](https://github.com/esuvajit/sperlin)', true)
			.setFooter(`© 2019 ${this.client.users.get(this.client.ownerID).tag}`, this.client.users.get(this.client.ownerID).displayAvatarURL());

		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util.send({ embed });
		}
		const msg = await message.util.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 30000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();
			return message;
		}
		react.first().message.delete();
		return message;
	}
}

module.exports = StatsCommand;
