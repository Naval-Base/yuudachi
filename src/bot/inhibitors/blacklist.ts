import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../util/constants';

export default class BlacklistInhibitor extends Inhibitor {
	public constructor() {
		super('blacklist', {
			reason: 'blacklist',
		});
	}

	public exec(message: Message) {
		const blacklist = this.client.settings.get('global', SETTINGS.BLACKLIST, ['']);
		return blacklist.includes(message.author.id);
	}
}
