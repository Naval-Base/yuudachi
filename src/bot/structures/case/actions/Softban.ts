import { User } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type SoftbanData = Omit<ActionData, 'duration'>;

export default class SoftbanAction extends Action {
	public constructor(data: SoftbanData) {
		super(ACTIONS.SOFTBAN, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error(MESSAGES.ACTIONS.INVALID_MEMBER);
		}
		const staff = this.client.settings.get(this.message.guild!, SETTINGS.MOD_ROLE)!;
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error(MESSAGES.ACTIONS.NO_STAFF);
		}

		if (
			this.client.caseHandler.cachedCases.has(this.keys![0]) &&
			this.client.caseHandler.cachedCases.has(this.keys![1])
		) {
			throw new Error(MESSAGES.ACTIONS.CURRENTLY_MODERATED);
		}
		this.client.caseHandler.cachedCases.add(this.keys![0]);
		this.client.caseHandler.cachedCases.add(this.keys![1]);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get(this.message.guild!, SETTINGS.CASES, 0) + 1;

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.SOFTBAN.PRE_REPLY(this.member.user.tag));

		try {
			try {
				await this.member.send(MESSAGES.ACTIONS.SOFTBAN.MESSAGE(this.message.guild!.name, this._reason));
			} catch {}
			await this.member.ban({
				days: this.days,
				reason: MESSAGES.ACTIONS.SOFTBAN.AUDIT(this.message.author.tag, totalCases),
			});
			await this.message.guild!.members.unban(
				this.member,
				MESSAGES.ACTIONS.SOFTBAN.AUDIT(this.message.author.tag, totalCases),
			);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys![0]);
			this.client.caseHandler.cachedCases.delete(this.keys![1]);
			throw new Error(MESSAGES.ACTIONS.SOFTBAN.ERROR(error.message));
		}

		this.client.settings.set(this.message.guild!, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.SOFTBAN.REPLY(this.member.user.tag));
	}
}
