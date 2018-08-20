const { Command } = require('discord-akairo');

class TagDownloadCommand extends Command {
	constructor() {
		super('tag-download', {
			category: 'tags',
			description: {
				content: 'Downloads a/all tag(s).',
				usage: '[tag]'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					'id': 'member',
					'match': 'content',
					'type': 'member',
					'default': ''
				}
			]
		});
	}

	exec(message, { member }) {
		const tags = await this.client.db.models.tags.findAll({ where: { user: member || undefined, guild: message.guild.id } });
		if (!tags.length) return;
		const output = tags.reduce((out, t) => {
			out += `Name: ${t.name}\r\nContent:\r\n${t.content.replace(/\n/g, '\r\n')}\r\n========================================\r\n`
			return out;
		}, '');
		
		return message.util.send('Haiiiii~', { files: [{ attachment: Buffer.from(output, 'utf8'), name: `${tag ? `${tag.name}_source` : 'all_sources' }.txt` }] });
	}
}

module.exports = TagDownloadCommand;
