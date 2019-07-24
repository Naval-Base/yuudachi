import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { TOPICS, EVENTS } from '../../util/logger';

export default class CommandCancelledListener extends Listener {
	public constructor() {
		super('commandCancelled', {
			emitter: 'commandHandler',
			event: 'commandCancelled',
			category: 'commandHandler'
		});
	}

	public exec(message: Message, command: Command): void {
		this.client.logger.info(`Cancelled ${command.id} on ${message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM'}`, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.COMMAND_CANCELLED });
	}
}
