const { Command } = require('discord-akairo');
const { Op } = require('sequelize');
const Tags = require('../../models/tags');
const { Util, MessageEmbed } = require('discord.js');

class SearchTagCommand extends Command {
	constructor() {
		super('tag-search', {
			category: 'tags',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'name',
					type: 'lowercase',
					match: 'content',
					prompt: {
						start: 'what would you like to search for?'
					}
				}
			],
			description: {
				content: 'Searches a tag.',
				usage: '<tag>'
			}
		});
	}

	async exec(message, { name }) {
		name = Util.cleanContent(name, message);
		const tags = await Tags.findAll({ where: { name: { [Op.like]: `%${name}%` }, guild: message.guild.id } });
		if (!tags.length) return message.util.reply(`No results found with query ${name}.`);
		const search = tags
			.map(tag => `\`${tag.name}\``)
			.sort()
			.join(', ');
		if (search.length >= 1950) {
			return message.util.reply('the output is way too big to display, make your search more specific and try again!');
		}
		const embed = new MessageEmbed()
			.setColor(5861569)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(search);

		return message.util.send(embed);
	}
}

module.exports = SearchTagCommand;
