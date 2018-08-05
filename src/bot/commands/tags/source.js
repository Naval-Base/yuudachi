const { Command } = require('discord-akairo');
const { cleanContent } = require('../../../util/cleanContent');

class TagSourceCommand extends Command {
	constructor() {
		super('tag-source', {
			category: 'tags',
			description: {
				content: 'Displays a tags source (Highlighted with Markdown).',
				usage: '<tag>'
			},
			channel: 'guild',
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

		return message.util.send(tag.content, { code: 'md' });
	}
}

module.exports = TagSourceCommand;
