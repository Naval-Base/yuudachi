import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ModerationInhibitor extends Inhibitor {
	public constructor() {
		super('moderation', {
			reason: 'moderation'
		});
	}

	public exec(message: Message) {
		if (message.util!.parsed! && message.util!.parsed!.command && message.util!.parsed!.command!.categoryID !== 'mod') return false;
		if (!this.client.settings.get(message.guild, 'moderation', undefined)) {
			return true;
		}
		return false;
	}
}
