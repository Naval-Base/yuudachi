const { Command } = require('discord-akairo');

class RestrictCommand extends Command {
	constructor() {
		super('restrict', {
			aliases: ['restrict'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'restriction',
					type: ['embed', 'embeds', 'image', 'images', 'img', 'emoji', 'reaction', 'react']
				},
				{
					id: 'rest',
					match: 'rest',
					default: ''
				}
			],
			description: {
				content: [
					'Restrict a members ability to post embeds/use custom emojis/react.',
					'',
					'Available Restrictions',
					' • embed `<member> <...reason>`',
					' • emoji `<member> <...reason>`',
					' • reaction `<member> <...reason>`',
					'',
					'Required: `<>` | Optional: `[]`',
					'For additional `<...arguments>` usage refer to the examples below.'
				],
				usage: '<restriction> <...argumens>',
				examples: [
					'img @Suvajit nsfw',
					'embed @Supriyo image spam',
					'emoji @Jack dumb',
					'reaction @Riday let\'s do it'
				]
			}
		});
	}

	exec(message, { restriction, rest }) {
		if (!restriction) {
			const prefix = this.handler.prefix(message);
			return message.util.send(`Check \`${prefix}help restrict\` for more information.`);
		}
		const command = {
			embed: this.handler.modules.get('restrict-embed'),
			embeds: this.handler.modules.get('restrict-embed'),
			image: this.handler.modules.get('restrict-embed'),
			images: this.handler.modules.get('restrict-embed'),
			img: this.handler.modules.get('restrict-embed'),
			emoji: this.handler.modules.get('restrict-emoji'),
			reaction: this.handler.modules.get('restrict-reaction'),
			react: this.handler.modules.get('restrict-reaction')
		}[restriction];

		return this.handler.handleDirectCommand(message, rest, command, true);
	}
}

module.exports = RestrictCommand;
