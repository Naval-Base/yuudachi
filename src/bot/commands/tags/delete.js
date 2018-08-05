const { Command } = require('discord-akairo');
const { cleanContent } = require('../../../util/cleanContent');

class TagDeleteCommand extends Command {
	constructor() {
		super('tag-delete', {
			category: 'tags',
			description: {
				content: 'Deletes a tag.',
				usage: '<tag>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					type: 'lowercase'
				}
			]
		});
	}

	async exec(message, { name }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		name = cleanContent(message, name);
		const tag = await this.client.db.models.tags.findOne({ where: { name, guild: message.guild.id } });
		if (!tag) return message.util.reply(`a tag with the name **${name}** doesn't exist.`);
		if (tag.user !== message.author.id && !staffRole) return message.util.reply('you can only delete your own tags.');
		tag.destroy();

		return message.util.reply(`successfully deleted **${name}**.`);
	}
}

module.exports = TagDeleteCommand;
