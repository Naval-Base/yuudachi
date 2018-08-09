const { Command } = require('discord-akairo');

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
					type: 'existingTag',
					prompt: {
						start: message => `${message.author}, what should the tag be named?`,
						retry: (message, _, provided) => `${message.author}, a tag with the name **${provided.phrase}** already exists.`
					}
				},
				{
					id: 'content',
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: message => `${message.author}, what should the content of the tag be?`
					}
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
		if (content && content.length >= 1950) {
			return message.util.reply("make sure the content isn't longer than 1950 characters!");
		}
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
