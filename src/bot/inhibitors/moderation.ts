import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../util/constants';

export default class ModerationInhibitor extends Inhibitor {
	public constructor() {
		super('moderation', {
			reason: 'moderation',
		});
	}

	public exec(message: Message) {
		if (message.util?.parsed?.command?.categoryID !== 'mod') {
			return false;
		}
		if (!this.client.settings.get(message.guild!, SETTINGS.MODERATION)) {
			return true;
		}
		return false;
	}
}
