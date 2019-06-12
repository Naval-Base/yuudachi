const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

class InvitesCommand extends Command {
	constructor() {
		super('invites', {
			aliases: ['invites'],
			channel: 'guild',
			category: 'info',
			clientPermissions: ['EMBED_LINKS', 'CREATE_INSTANT_INVITE'],
			description: {
				content: 'Sends a list of server invites (max 25).',
				examples: ['']
			}
		});
	}

	async exec(message) {
		const invites = await message.guild.fetchInvites();
		if (invites.size >= 25) return message.util.send('Too many server invites!');

		const embed = new MessageEmbed().setColor(5861569)
			.setAuthor('Server Invites', message.guild.iconURL())
			.setThumbnail(message.guild.iconURL());

		for (const invite of invites.values()) {
			embed.addField(invite.inviter ? invite.inviter.tag : 'Widget#0000', [
				`${invite.channel}, ${invite.uses} uses`,
				`https://discord.gg/${invite.code}`,
				`Created on ${moment(invite.createdTimestamp).format('ddd D MMM YYYY, h:mm:ss A')}`
			]);
		}
		return message.util.send(embed);
	}
}

module.exports = InvitesCommand;
