const { Command, Flag } = require('discord-akairo');
const { Op } = require('sequelize');
const Tags = require('../../models/tags');
const { Util } = require('discord.js');

class TagShowCommand extends Command {
	constructor() {
		super('tag-show', {
			category: 'tags',
			channel: 'guild',
			description: {
				content: 'Displays a tag.',
				usage: '<tag>'
			},
			args: [
				{
					id: 'tag',
					match: 'content',
					type: async (message, phrase) => {
						phrase = Util.cleanContent(phrase.toLowerCase(), message);
						const tag = await Tags.findOne({
							where: {
								[Op.or]: [
									{ name: phrase },
									{ aliases: { [Op.contains]: [phrase] } }
								], guild: message.guild.id
							}
						});

						if (!tag) return Flag.cancel();
						return tag;
					},
					prompt: {
						start: 'what tag would you like to see?'
					}
				}
			]
		});
	}

	async exec(message, { tag }) {
		if (!tag) return;
		return message.util.send(`${tag.content}`);
	}
}

module.exports = TagShowCommand;
