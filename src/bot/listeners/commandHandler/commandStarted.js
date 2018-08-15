const { Listener } = require('discord-akairo');
const Raven = require('raven');

class CommandStartedListener extends Listener {
	constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commandHandler'
		});
	}

	exec(message, command, args) {
		Raven.setContext({
			user: {
				id: message.author.id,
				username: message.author.tag
			},
			extra: {
				/* eslint-disable multiline-ternary */
				guild: message.guild ? {
					id: message.guild.id,
					name: message.guild.name
				} : null,
				command: {
					id: command.id,
					aliases: command.aliases,
					category: command.category
				},
				message: {
					id: message.id,
					content: message.content
				},
				args
			}
			/* eslint-enable multiline-ternary */
		});
	}
}

module.exports = CommandStartedListener;
