import { User } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type EmbedData = Omit<ActionData, 'days' | 'duration'>;

export default class EmbedAction extends Action {
	public constructor(data: EmbedData) {
		super(ACTIONS.EMBED, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error(MESSAGES.ACTIONS.INVALID_MEMBER);
		}
		const guild = this.message.guild!;
		const staff = this.client.settings.get(guild, SETTINGS.MOD_ROLE);
		if (this.member.roles.has(staff ?? '')) {
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

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.EMBED.PRE_REPLY(this.member.user.tag));

		try {
			await this.member.roles.add(
				restrictRoles.EMBED,
				MESSAGES.ACTIONS.EMBED.AUDIT(this.message.author.tag, totalCases),
			);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.EMBED.ERROR(error.message));
		}

		this.client.settings.set(guild, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.EMBED.REPLY(this.member.user.tag));
	}
}
