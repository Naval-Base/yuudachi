const { Command } = require('discord-akairo');

class TagDeleteCommand extends Command {
	constructor() {
		super('tag-delete', {
			category: 'tags',
			channel: 'guild',
			description: {
				content: 'Deletes a tag.',
				usage: '<tag>'
			},
			args: [
				{
					id: 'tag',
					type: 'findTag',
					match: 'content',
					prompt: {
						start: 'what tag do you want to delete?',
						retry: (msg, { phrase }) => `a tag with the name **${phrase}** does not exist.`
					}
				}
			]
		});
	}

	async exec(message, { tag }) {
		const permission = message.member.permissions.has('MANAGE_GUILD');
		if (tag.author !== message.author.id && !permission) return message.util.reply('you can only delete your own tags.');
		await tag.destroy();

		return message.util.reply(`successfully deleted **${tag.name.substring(0, 256)}**.`);
	}
}

module.exports = TagDeleteCommand;
