import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SendPermissionsInhibitor extends Inhibitor {
	public constructor() {
		super('sendPermissions', {
			reason: 'sendPermissions',
		});
	}

	public exec(message: Message) {
		if (message.channel.type === 'dm') return false;
		return !message.channel.permissionsFor(message.guild!.me!)?.has('SEND_MESSAGES');
	}
}
