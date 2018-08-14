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
			/* eslint-disable multiline-ternary */
			guild: message.guild ? {
				id: message.guild.id,
				name: message.guild.name
			} : null,
			/* eslint-enable multiline-ternary */
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
		});
	}
}

module.exports = CommandStartedListener;
