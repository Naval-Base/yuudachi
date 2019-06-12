const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

class TagInfoCommand extends Command {
	constructor() {
		super('tag-info', {
			category: 'tags',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Displays information about a tag.',
				usage: '<tag>'
			},
			args: [
				{
					id: 'tag',
					type: 'findTag',
					match: 'content',
					prompt: {
						start: 'what tag do you want information on?',
						retry: (msg, { phrase }) => `a tag with the name **${phrase}** does not exist.`
					}
				}
			]
		});
	}

	async exec(message, { tag }) {
		const user = await this.client.users.fetch(tag.author).catch(() => false);
		const lastModifiedBy = await this.client.users.fetch(tag.last_modified).catch(() => false);

		const guild = this.client.guilds.get(tag.guild);
		const embed = new MessageEmbed()
			.setColor(5861569)
			.setAuthor(user ? user.tag : 'Invalid#0000', user ? user.displayAvatarURL() : null)
			.setTitle(tag.name)
			.addField('Aliases', tag.aliases.length ? tag.aliases.map(t => `${t}`).sort().join(', ') : 'No Aliases')
			.addField('Uses', tag.uses)
			.addField('Guild', guild.name)
			.addField('Created at', moment.utc(tag.createdAt).format('MMMM D, YYYY, kk:mm:ss'))
			.addField('Modified at', moment.utc(tag.updatedAt).format('MMMM D, YYYY, kk:mm:ss'));
		if (lastModifiedBy) {
			embed.addField('Last Modified', lastModifiedBy ? `${lastModifiedBy.tag}` : 'Couldn\'t Fetch User');
		}

		return message.util.send({ embed });
	}
}

module.exports = TagInfoCommand;
