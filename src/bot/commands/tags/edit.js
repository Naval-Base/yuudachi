const { Command, Control } = require('discord-akairo');
const { Util } = require('discord.js');

class TagEditCommand extends Command {
	constructor() {
		super('tag-edit', {
			category: 'tags',
			description: {
				content: 'Edit a tag (Markdown can be used).',
				usage: '<tag> <content>',
				examples: ['Test Some new content', '"Test 1" Some more new content']
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					type: 'tag',
					prompt: {
						start: message => `${message.author}, what tag do you want to edit?`,
						retry: (message, _, provided) => `${message.author}, a tag with the name **${provided.phrase}** does not exist.`
					}
				},
				{
					id: 'hoisted',
					match: 'option',
					flag: '--hoisted='
				},
				Control.if((_, args) => args.hoisted, [
					{
						id: 'content',
						match: 'rest',
						type: 'tagContent'
					}
				], [
					{
						id: 'content',
						match: 'rest',
						type: 'tagContent',
						prompt: {
							start: message => `${message.author}, what should the new content be?`
						}
					}
				])
			]
		});
	}

	async exec(message, { tag, hoisted, content }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		if (tag.user !== message.author.id && !staffRole) return message.util.reply('you can only edit your own tags.');
		if (content && content.length >= 1950) {
			return message.util.reply("make sure the content isn't longer than 1950 characters!");
		}
		hoisted = Boolean(JSON.parse(hoisted));
		tag.hoisted = hoisted;
		if (content) {
			content = Util.cleanContent(content, message);
			tag.content = content;
		}
		console.log(tag, hoisted, content);
		await tag.save();

		return message.util.reply(`successfully edited **${tag.name}**${hoisted ? ' to be hoisted.' : '.'}`);
	}
}

module.exports = TagEditCommand;
