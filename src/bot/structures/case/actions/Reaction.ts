import { User } from 'discord.js';
import { ACTIONS } from '../../../util';
import Action, { ActionData } from './Action';

type ReactionData = Omit<ActionData, 'days' | 'duration'>;

export default class ReactionAction extends Action {
	public constructor(data: ReactionData) {
		super(ACTIONS.REACTION, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error('you have to provide a valid user on this guild.');
		}
		const staff = this.client.settings.get<string>(this.message.guild!, 'modRole', undefined);
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error('nuh-uh! You know you can\'t do this.');
		}

		const restrictRoles = this.client.settings.get<{ reaction: string }>(this.message.guild!, 'restrictRoles', undefined);
		if (!restrictRoles) throw new Error('there are no restricted roles configured on this server.');

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0) + 1;
		const restrictRoles = this.client.settings.get<{ reaction: string }>(this.message.guild!, 'restrictRoles', undefined);

		const sentMessage = await this.message.channel.send(`Reaction restricting **${this.member.user.tag}**...`);

		try {
			await this.member.roles.add(restrictRoles.reaction, `Reaction restricted by ${this.message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(`there was an error reaction restricting this member \`${error.message}\``);
		}

		this.client.settings.set(this.message.guild!, 'caseTotal', totalCases);

		sentMessage.edit(`Successfully reaction restricted **${this.member.user.tag}**`);
	}
}
