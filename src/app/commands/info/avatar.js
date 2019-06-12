const { Command } = require('discord-akairo');

class AvatarCommand extends Command {
	constructor() {
		super('avatar', {
			aliases: ['avatar'],
			category: 'info',
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			description: {
				content: 'Displays avatar of a member.',
				usage: '<member>',
				examples: ['@Suvajit', 'Suvajit', '444432489818357760']
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
			.setAuthor(member.user.tag)
			.setImage(member.user.avatarURL({ size: 2048 }));

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

module.exports = AvatarCommand;
