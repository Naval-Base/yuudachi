const { Command } = require('discord-akairo');
const Tags = require('../../models/tags');

class TagAddCommand extends Command {
	constructor() {
		super('tag-add', {
			category: 'tags',
			channel: 'guild',
			description: {
				content: 'Adds a tag, usable for everyone on the server (Markdown can be used).',
				usage: '[--hoist] <tag> <content>',
				examples: ['Test Test', '--hoist "Test 2" Test2', '"Test 3" "Some more text" --hoist']
			},
			args: [
				{
					id: 'name',
					type: 'existingTag',
					prompt: {
						start: 'what should the tag be named?',
						retry: (msg, { phrase }) => `a tag with the name **${phrase}** already exists.`
					}
				},
				{
					id: 'content',
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: 'what should the content of the tag be?'
					}
				},
				{
					id: 'hoist',
					match: 'flag',
					flag: ['--hoist', '--pin']
				}
			]
		});
	}

	async exec(message, { name, content, hoist }) {
		if (name && name.length >= 256) {
			return message.util.reply('tag names have a limit of 256 characters!');
		}
		if (content && content.length >= 1950) {
			return message.util.reply('messages have a limit of 2000 characters!');
		}
		const permission = message.member.permissions.has('MANAGE_GUILD');

		await Tags.create({
			name,
			content,
			hoisted: hoist && permission ? true : false,
			author: message.author.id,
			guild: message.guild.id,
			last_modified: message.author.id
		});

		return message.util.reply(`A tag with the name **${name.substring(0, 256)}** has been added.`);
	}
}

module.exports = TagAddCommand;
