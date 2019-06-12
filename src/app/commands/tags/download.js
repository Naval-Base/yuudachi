const { Command } = require('discord-akairo');
const Tags = require('../../models/tags');

class TagDownloadCommand extends Command {
	constructor() {
		super('tag-download', {
			category: 'tags',
			channel: 'guild',
			description: {
				content: 'Downloads a/all tag(s).',
				usage: '[member]'
			},
			args: [
				{
					id: 'member',
					type: 'member',
					default: ''
				}
			]
		});
	}

	async exec(message, { member }) {
		const data = member ? { author: member.id, guild: message.guild.id } : { guild: message.guild.id };
		const tags = await Tags.findAll({ where: data });
		if (!tags.length) return;
		const output = tags.reduce((out, t) => {
			out += `Name: ${t.name}\r\nContent:\r\n${t.content.replace(/\n/g, '\r\n')}\r\n\r\n========================================\r\n\r\n`;
			return out;
		}, '');

		return message.util.send('Haiiiii~', { files: [{ attachment: Buffer.from(output, 'utf8'), name: `${member ? `${member.displayName}s_tags` : 'all_tags'}.txt` }] });
	}
}

module.exports = TagDownloadCommand;
