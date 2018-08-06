const { Command } = require('discord-akairo');
const { cleanContent } = require('../../../util/cleanContent');
const { Op } = require('sequelize');

class TagAddCommand extends Command {
	constructor() {
		super('tag-add', {
			category: 'tags',
			description: {
				content: 'Adds a tag, usable for everyone on the server (Markdown can be used).',
				usage: '[--hoisted] <tag> <content>',
				examples: ['Test Test', '--hoisted "Test 2" Test2', '"Test 3" "Some more text" --hoisted']
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					type: 'lowercase'
				},
				{
					id: 'content',
					match: 'rest',
					type: 'string'
				},
				{
					id: 'hoisted',
					match: 'flag',
					flag: '--hoisted'
				}
			]
		});
	}

	async exec(message, { name, content, hoisted }) {
		name = cleanContent(message, name);
		content = cleanContent(message, content);
		const tag = await this.client.db.models.tags.findOne({
			where: {
				[Op.or]: [
					{ name },
					{ aliases: { [Op.contains]: [name] } }
				],
				guild: message.guild.id
			}
		});
		if (tag) return message.util.reply(`a tag with the name **${name}** already exists.`);
		await this.client.db.models.tags.create({
			user: message.author.id,
			guild: message.guild.id,
			name,
			hoisted: hoisted ? true : false,
			content
		});

		return message.util.reply(`a tag with the name **${name}** has been added.`);
	}
}

module.exports = TagAddCommand;
