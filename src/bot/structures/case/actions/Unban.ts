import { GuildMember } from 'discord.js';
import { ACTIONS } from '../../../util';
import Action, { ActionData } from './Action';

type UnbanData = Omit<ActionData, 'days' | 'duration'>;

export default class UnbanAction extends Action {
	public constructor(data: UnbanData) {
		super(ACTIONS.UNBAN, data);
	}

	public async before() {
		if (this.member instanceof GuildMember) {
			throw new Error('you have to provide a valid user not on this guild.');
		}

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof GuildMember) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0) + 1;

		const sentMessage = await this.message.channel.send(`Unbanning **${this.member.tag}**...`);

		try {
			await this.message.guild!.members.unban(this.member, `Unbanned by ${this.message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(`there was an error unbanning this member \`${error.message}\``);
		}

		this.client.settings.set(this.message.guild!, 'caseTotal', totalCases);

		sentMessage.edit(`Successfully unbanned **${this.member.tag}**`);
	}
}
