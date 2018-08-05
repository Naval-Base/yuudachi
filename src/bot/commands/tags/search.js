const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { cleanContent } = require('../../../util/cleanContent');
const { Op } = require('sequelize');

class SearchTagCommand extends Command {
	constructor() {
		super('tag-search', {
			category: 'tags',
			description: {
				content: 'Searches a tag.',
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
		const tags = await this.client.db.models.tags.findAll({ where: { name: { [Op.like]: `%${name}%` }, guild: message.guild.id } });
		if (!tags) return message.util.reply(`a tag with the name **${name}** doesn't exist.`);
		const embed = new MessageEmbed()
			.setColor(0x30a9ed)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(
				tags
					.map(tag => `\`${tag.name}\``)
					.sort()
					.join(', ')
			);

		return message.util.send(embed);
	}
}

module.exports = SearchTagCommand;
