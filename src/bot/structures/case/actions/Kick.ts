import { User } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type KickData = Omit<ActionData, 'days' | 'duration'>;

export default class KickAction extends Action {
	public constructor(data: KickData) {
		super(ACTIONS.KICK, data);
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

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.KICK.PRE_REPLY(this.member.user.tag));

		try {
			try {
				await this.member.send(MESSAGES.ACTIONS.KICK.MESSAGE(this.message.guild!.name, this._reason));
			} catch {}
			await this.member.kick(MESSAGES.ACTIONS.KICK.AUDIT(this.message.author.tag, totalCases));
		} catch (error) {
			throw new Error(MESSAGES.ACTIONS.KICK.ERROR(error.message));
		}

		this.client.settings.set(this.message.guild!, SETTINGS.CASES, totalCases);

		this.client.caseHandler.cachedCases.delete(this.keys as string);

		sentMessage.edit(MESSAGES.ACTIONS.KICK.REPLY(this.member.user.tag));
	}
}
