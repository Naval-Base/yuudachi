const { Command } = require('discord-akairo');
const { cleanContent } = require('../../../util/cleanContent');

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
					id: 'name',
					type: 'lowercase',
					prompt: {
						start: message => `${message.author}, what tag do you want to edit?`
					}
				},
				{
					id: 'content',
					match: 'rest',
					type: 'string',
					prompt: {
						start: message => `${message.author}, what should the new content be?`
					}
				}
			]
		});
	}

	async exec(message, { name, content }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		name = cleanContent(message, name);
		content = cleanContent(message, content);
		const tag = await this.client.db.models.tags.findOne({ where: { name, guild: message.guild.id } });
		if (!tag) return message.util.reply(`a tag with the name **${name}** doesn't exist.`);
		if (tag.user !== message.author.id && !staffRole) return message.util.reply('you can only edit your own tags.');
		await this.client.db.models.tags.update({ content }, { where: { name, guild: message.guild.id } });

		return message.util.reply(`successfully edited **${name}**.`);
	}
}

module.exports = TagEditCommand;
