import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MessageBlockedListener extends Listener {
	public constructor() {
		super('messageBlocked', {
			emitter: 'commandHandler',
			event: 'messageBlocked',
			category: 'commandHandler'
		});
	}

	public exec(message: Message, reason: string): void {
		this.client.logger.info(`Blocked ${message.author!.tag} (${message.author!.id}) on ${message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM'} with reason ${reason}`, { topic: 'DISCORD-AKAIRO', event: 'MESSAGE_BLOCKED' });
	}
}
