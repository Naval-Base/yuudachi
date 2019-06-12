const { Command } = require('discord-akairo');
const moment = require('moment');

const HUMAN_LEVELS = {
	0: 'None',
	1: 'Low',
	2: 'Medium',
	3: '(╯°□°）╯︵ ┻━┻',
	4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

class ServerInfoCommand extends Command {
	constructor() {
		super('serverinfo', {
			aliases: ['server', 'serverinfo', 'guild'],
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Get info about your Guild.'
			}
		});
	}

	async exec(message) {
		const members = await message.guild.members.fetch();
		const bot = members.filter(m => m.user.bot).size;

		const embed = this.client.util.embed().setColor(5861569)
			.setAuthor(`${message.guild.name} (${message.guild.id})`, message.guild.iconURL())
			.setThumbnail(message.guild.iconURL())
			.addField('Members', message.guild.memberCount)
			.addField('Bots', bot)
			.addField('Roles', message.guild.roles.size)
			.addField('Text Channels', message.guild.channels.filter(ch => ch.type === 'text').size)
			.addField('Voice Channels', message.guild.channels.filter(ch => ch.type === 'voice').size)
			.addField('AFK', message.guild.afkChannelID ? `<#${message.guild.afkChannelID}> after ${message.guild.afkTimeout / 60} min` : 'None')
			.addField('Region', message.guild.region.toUpperCase())
			.addField('Created at', moment.utc(message.guild.createdAt).format('MMMM D, YYYY, kk:mm:ss'))
			.addField('Owner', `${message.guild.owner.user.tag} (${message.guild.ownerID})`)
			.addField('Verification Level', HUMAN_LEVELS[message.guild.verificationLevel]);

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

module.exports = ServerInfoCommand;
