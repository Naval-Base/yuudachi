const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { cleanContent } = require('../../../util/cleanContent');
const moment = require('moment');

class TagInfoCommand extends Command {
	constructor() {
		super('tag-info', {
			category: 'tags',
			description: {
				content: 'Displays information about a tag.',
				usage: '<tag>'
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'name',
					match: 'content',
					type: 'lowercase'
				}
			]
		});
	}

	async exec(message, { name }) {
		name = cleanContent(message, name);
		const tag = await this.client.db.models.tags.findOne({ where: { name, guild: message.guild.id } });
		if (!tag) return message.util.reply(`a tag with the name **${name}** doesn't exist.`);
		const user = await this.client.users.fetch(tag.user);
		const guild = this.client.guilds.get(tag.guild);
		const embed = new MessageEmbed()
			.setColor(3447003)
			.addField('User', user ? `${user.tag} (ID: ${user.id})` : "Couldn't fetch user.")
			.addField('Guild', guild ? `${guild.name}` : "Could'nt fetch guild.")
			.addField('Uses', tag.uses)
			.addField('Created at', moment.utc(tag.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss ZZ'))
			.addField('Modified at', moment.utc(tag.updatedAt).format('dddd, MMMM Do YYYY, HH:mm:ss ZZ'));

		return message.util.send(embed);
	}
}

module.exports = TagInfoCommand;
