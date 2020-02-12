import { User } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type TagData = Omit<ActionData, 'days' | 'duration'>;

export default class TagAction extends Action {
	public constructor(data: TagData) {
		super(ACTIONS.TAG, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error(MESSAGES.ACTIONS.INVALID_MEMBER);
		}
		const guild = this.message.guild!;
		const staff = this.client.settings.get(guild, SETTINGS.MOD_ROLE);
		if (this.member.roles.cache.has(staff ?? '')) {
			throw new Error(MESSAGES.ACTIONS.NO_STAFF);
		}

		const restrictRoles = this.client.settings.get(guild, SETTINGS.RESTRICT_ROLES);
		if (!restrictRoles) throw new Error(MESSAGES.ACTIONS.NO_RESTRICT);

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error(MESSAGES.ACTIONS.CURRENTLY_MODERATED);
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const guild = this.message.guild!;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0) + 1;
		const restrictRoles = this.client.settings.get(guild, SETTINGS.RESTRICT_ROLES)!;

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.TAG.PRE_REPLY(this.member.user.tag));

		try {
			await this.member.roles.add(restrictRoles.TAG, MESSAGES.ACTIONS.TAG.AUDIT(this.message.author.tag, totalCases));
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.TAG.ERROR(error.message));
		}

		this.client.settings.set(guild, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.TAG.REPLY(this.member.user.tag));
	}
}
