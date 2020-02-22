import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../util/constants';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			description: {
				content: MESSAGES.COMMANDS.UTIL.PING.DESCRIPTION,
			},
			category: 'util',
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const msg = await message.util?.send('Pinging...');
		if (!msg) return null;

		return message.util?.send(
			MESSAGES.COMMANDS.UTIL.PING.RESPONSES[Math.floor(Math.random() * MESSAGES.COMMANDS.UTIL.PING.RESPONSES.length)]
				.replace(
					'$(ping)',
					(
						(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
					).toString(),
				)
				.replace('$(heartbeat)', Math.round(this.client.ws.ping).toString()),
		);
	}
}
