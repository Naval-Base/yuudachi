import { User } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type WarnData = Omit<ActionData, 'days' | 'duration'>;

export default class WarnAction extends Action {
	public constructor(data: WarnData) {
		super(ACTIONS.WARN, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error(MESSAGES.ACTIONS.INVALID_MEMBER);
		}
		const staff = this.client.settings.get(this.message.guild!, SETTINGS.MOD_ROLE)!;
		if (this.member.roles.has(staff)) {
			throw new Error(MESSAGES.ACTIONS.NO_STAFF);
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get(this.message.guild!, SETTINGS.CASES, 0) + 1;

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.WARN.PRE_REPLY(this.member.user.tag));

		this.client.settings.set(this.message.guild!, SETTINGS.CASES, totalCases);

		this.client.caseHandler.cachedCases.delete(this.keys as string);

		sentMessage.edit(MESSAGES.ACTIONS.WARN.REPLY(this.member.user.tag));
	}
}
