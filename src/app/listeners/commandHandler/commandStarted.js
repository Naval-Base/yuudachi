const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');
const { addBreadcrumb, Severity } = require('@sentry/node');

class CommandStartedListener extends Listener {
	constructor() {
		super('commandStarted', {
			event: 'commandStarted',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	async exec(message, command, args) {
		const level = message.guild ? `${message.guild.name}/${message.author.tag}` : `${message.author.tag}`;
		Logger.log(`${command.id}`, { level });

		addBreadcrumb({
			message: 'command_started',
			category: command.category.id,
			level: Severity.Info,
			data: {
				user: {
					id: message.author.id,
					username: message.author.tag
				},
				guild: message.guild
					? {
						id: message.guild.id,
						name: message.guild.name
					}
					: null,
				command: {
					id: command.id,
					aliases: command.aliases,
					category: command.category.id
				},
				message: {
					id: message.id,
					content: message.content
				},
				args
			}
		});
	}
}

module.exports = CommandStartedListener;
