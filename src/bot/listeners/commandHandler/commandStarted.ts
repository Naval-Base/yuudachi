import { addBreadcrumb, setContext, Severity } from '@sentry/node';
import { Command, Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { EVENTS, TOPICS } from '../../util/logger';

export default class CommandStartedListener extends Listener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commandHandler'
		});
	}

	public exec(message: Message, command: Command, args: any) {
		this.client.logger.info(`Started ${command.id} on ${message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM'}${Object.keys(args).length && !args.command ? ` with arguments ${JSON.stringify(args)}` : ''}`, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.COMMAND_STARTED });
		this.client.prometheus.commandCounter.inc();
		addBreadcrumb({
			message: 'command_started',
			category: command.category.id,
			level: Severity.Info,
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
		setContext('command_started', {
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
