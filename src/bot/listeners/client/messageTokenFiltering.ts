import { stripIndents } from 'common-tags';
import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../../util/constants';

export default class MessageTokenFilteringListener extends Listener {
	public constructor() {
		super('messageTokenFiltering', {
			emitter: 'client',
			event: 'message',
			category: 'client',
		});
	}

	public async exec(message: Message) {
		if (!message.guild) return;
		const tokenFiltering = this.client.settings.get(message.guild, SETTINGS.TOKEN_FILTER);
		if (!tokenFiltering) return;
		// Bot ID: 24, Timestamp: 6, Cryptographic: Rest
		const matches = /([\w-]+={0,2})\.([\w-]+={0,2})\.([\w-]+={0,2})/g.exec(message.content);
		if (!matches) return;
		const [, botID] = matches;
		try {
			// Convert the first part of the token to a bot ID (throws if invalid)
			BigInt(Buffer.from(botID, 'base64').toString());
			if (message.deletable) await message.delete({ reason: 'Token Filtering: Message contained bot token' });
			message.channel
				.send(stripIndents`${message.author}, the message you posted contained a bot token, you should reset it!

				> Go to <https://discordapp.com/developers/applications> and then click on the application that corresponds with your bot
				> Click "Bot" on the left side 
				> Click the "Regenerate" button and then "Yes, do it!" on the popup.

				https://i.imgur.com/XtQsR9s.png`);
		} catch {}
	}
}
