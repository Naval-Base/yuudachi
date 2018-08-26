const { Listener } = require('discord-akairo');
const Raven = require('raven');

class CommandErrorListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	exec(error, message, command) {
		this.client.logger.error(error);
		Raven.captureBreadcrumb({
			message: 'command_errored',
			category: command.category.id,
			data: {
				user: {
					id: message.author.id,
					username: message.author.tag
				},
				/* eslint-disable multiline-ternary */
				guild: message.guild ? {
					id: message.guild.id,
					name: message.guild.name
				} : null,
				command: {
					id: command.id,
					aliases: command.aliases,
					category: command.category.id
				},
				message: {
					id: message.id,
					content: message.content
				}
				/* eslint-enable multiline-ternary */
			}
		});
		Raven.captureException(error);
	}
}

module.exports = CommandErrorListener;
