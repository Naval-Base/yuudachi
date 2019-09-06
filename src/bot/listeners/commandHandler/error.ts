import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { addBreadcrumb, setContext, captureException, Severity } from '@sentry/node';
import { TOPICS, EVENTS } from '../../util/logger';

export default class CommandErrorListener extends Listener {
	public constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	public exec(error: Error, message: Message, command: Command) {
		// @ts-ignore
		this.client.logger.error(error, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.COMMAND_ERROR });
		addBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			level: Severity.Error,
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
				command: command
					? {
						id: command.id,
						aliases: command.aliases,
						category: command.category.id
					}
					: null,
				message: {
					id: message.id,
					content: message.content
				}
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
				}
			}
		});
		captureException(error);
	}
}
