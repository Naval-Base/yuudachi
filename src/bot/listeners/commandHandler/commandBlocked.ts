import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class CommandBlockedListener extends Listener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
			category: 'commandHandler'
		});
	}

	public exec(message: Message, command: Command, reason: string): void {
		this.client.logger.info(`Blocked ${command.id} on ${message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM'} with reason ${reason}`, { topic: 'DISCORD-AKAIRO', event: 'COMMAND_BLOCKED' });
	}
}
