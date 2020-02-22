import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../util/constants';

export default class TagRestrictedInhibitor extends Inhibitor {
	public constructor() {
		super('tagRestricted', {
			reason: 'tagRestricted',
		});
	}

	public exec(message: Message) {
		if (!message.guild) return false;
		if (message.util?.parsed?.command?.categoryID !== 'tag') {
			return false;
		}
		const restrictedRoles = this.client.settings.get(message.guild, SETTINGS.RESTRICT_ROLES);
		if (!restrictedRoles) {
			return false;
		}
		const hasRestrictedRole = message.member?.roles.cache.has(restrictedRoles.TAG);
		if (hasRestrictedRole) {
			return true;
		}
		return false;
	}
}
