const { Command } = require('discord-akairo');
const moment = require('moment');

class UserInfoCommand extends Command {
	constructor() {
		super('userinfo', {
			aliases: ['user', 'userinfo'],
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Get info about a GuildMember.',
				usage: '<member>',
				examples: ['', 'Suvajit', '444432489818357760']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					match: 'content',
					default: message => message.member
				}
			]
		});
	}

	async exec(message, { member }) {
		const embed = this.client.util.embed().setColor(5861569)
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setThumbnail(member.user.displayAvatarURL())
			.addField('ID', member.user.id)
			.addField('Nickname', member.nickname ? member.nickname : 'None')
			.addField('Account Type', member.user.bot ? 'Bot account' : 'User account')
			.addField('Joined at', moment.utc(member.joinedAt).format('MMMM D, YYYY, kk:mm:ss'))
			.addField('Created at', moment.utc(member.user.createdAt).format('MMMM D, YYYY, kk:mm:ss'))
			.addField('Status', member.user.presence.status.toUpperCase())
			.addField('Activity', member.user.presence.activity ? member.user.presence.activity.name : 'None');

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

module.exports = UserInfoCommand;
