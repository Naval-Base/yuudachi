import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
const Raven = require('raven'); // eslint-disable-line

export default class CommandStartedListener extends Listener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commandHandler'
		});
	}

	public exec(message: Message, command: Command, args: any[]): void {
		this.client.prometheus.commandCounter.inc();
		Raven.captureBreadcrumb({
			message: 'command_started',
			category: command.category.id,
			data: {
				user: {
					id: message.author!.id,
					username: message.author!.tag
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
		Raven.setContext({
			user: {
				id: message.author!.id,
				username: message.author!.tag
			},
			extra: {
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
