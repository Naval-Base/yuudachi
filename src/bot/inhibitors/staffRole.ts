import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { SETTINGS } from '../util/constants';

export default class StaffRoleInhibitor extends Inhibitor {
	public constructor() {
		super('staffRole', {
			reason: 'staffRole',
		});
	}

	public exec(message: Message) {
		if (!message.guild) return false;
		if (message.util?.parsed?.command?.categoryID !== 'mod') {
			return false;
		}
		const staffRole = this.client.settings.get(message.guild, SETTINGS.MOD_ROLE);
		if (!staffRole) {
			return true;
		}
		const hasStaffRole = message.member?.roles.has(staffRole);
		if (!hasStaffRole) {
			return true;
		}
		return false;
	}
}
