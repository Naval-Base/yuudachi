const { Command } = require('discord-akairo');

class TagSourceCommand extends Command {
	constructor() {
		super('tag-source', {
			category: 'tags',
			channel: 'guild',
			description: {
				content: 'Displays a tags source (Highlighted with Markdown).',
				usage: '[--file/-f] <tag>'
			},
			args: [
				{
					id: 'file',
					match: 'flag',
					flag: ['--file', '-f']
				},
				{
					id: 'tag',
					match: 'rest',
					type: 'findTag',
					prompt: {
						start: 'what tag would you like to see the source of?',
						retry: (msg, { phrase }) => `a tag with the name **${phrase}** does not exist.`
					}
				}
			]
		});
	}

	exec(message, { tag, file }) {
		return message.util.send(tag.content, {
			code: 'md',
			// eslint-disable-next-line multiline-ternary
			files: file ? [{
				attachment: Buffer.from(tag.content.replace(/\n/g, '\r\n'), 'utf8'), name: `${tag.name}_source.txt`
			}] : undefined
		});
	}
}

module.exports = TagSourceCommand;
