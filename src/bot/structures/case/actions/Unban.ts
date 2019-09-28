import { GuildMember } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type UnbanData = Omit<ActionData, 'days' | 'duration'>;

export default class UnbanAction extends Action {
	public constructor(data: UnbanData) {
		super(ACTIONS.UNBAN, data);
	}

	public async before() {
		if (this.member instanceof GuildMember) {
			throw new Error(MESSAGES.ACTIONS.INVALID_USER);
		}

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error(MESSAGES.ACTIONS.CURRENTLY_MODERATED);
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof GuildMember) return;
		const totalCases = this.client.settings.get(this.message.guild!, SETTINGS.CASES, 0) + 1;

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.UNBAN.PRE_REPLY(this.member.tag));

		try {
			await this.message.guild!.members.unban(
				this.member,
				MESSAGES.ACTIONS.UNBAN.AUDIT(this.message.author!.tag, totalCases),
			);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.UNBAN.ERROR(error.message));
		}

		this.client.settings.set(this.message.guild!, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.UNBAN.REPLY(this.member.tag));
	}
}
