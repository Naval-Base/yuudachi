import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

// Bot ID: 24, Timestamp: 6, Cryptographic: Rest
const TOKEN_REGEX = /(.+)\.(.+)\.(.+)/g;

export default class MessageTokenFilteringListener extends Listener {
	public constructor() {
		super('messageTokenFiltering', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		});
	}

	public async exec(message: Message): Promise<Message | Message[] | void> {
		if (!message.guild) return;
		const tokenFiltering = this.client.settings.get(message.guild, 'tokenFiltering', undefined);
		if (!tokenFiltering) return;
		const matches = message.content.match(TOKEN_REGEX);
		if (!matches) return;
		const [botID] = matches;
		try {
			// Convert the first part of the token to a bot ID (throws if invalid)
			BigInt(Buffer.from(botID, 'base64').toString());
			if (message.deletable) await message.delete({ reason: 'Token Filtering: Message contained bot token' });
			message.util!.reply("the message you posted contained a bot token! You should reset your bot's token");
		} catch {}
	}
}
