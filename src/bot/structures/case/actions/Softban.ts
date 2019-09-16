import { stripIndents } from 'common-tags';
import { User } from 'discord.js';
import { ACTIONS } from '../../../util';
import Action, { ActionData } from './Action';

type SoftbanData = Omit<ActionData, 'duration'>;

export default class SoftbanAction extends Action {
	public constructor(data: SoftbanData) {
		super(ACTIONS.SOFTBAN, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error('you have to provide a valid user on this guild.');
		}
		const staff = this.client.settings.get<string>(this.message.guild!, 'modRole', undefined);
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error("nuh-uh! You know you can't do this.");
		}

		if (
			this.client.caseHandler.cachedCases.has(this.keys![0]) &&
			this.client.caseHandler.cachedCases.has(this.keys![1])
		) {
			throw new Error('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(this.keys![0]);
		this.client.caseHandler.cachedCases.add(this.keys![1]);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0) + 1;

		const sentMessage = await this.message.channel.send(`Softbanning **${this.member.user.tag}**...`);

		try {
			try {
				await this.member.send(stripIndents`
					**You have been softbanned from ${this.message.guild!.name}**
					${this.reason ? `\n**Reason:** ${this.reason}\n` : ''}
					A softban is a kick that uses ban + unban to remove your messages from the server.
					You may rejoin whenever.
				`);
			} catch {}
			await this.member.ban({
				days: this.days,
				reason: `Softbanned by ${this.message.author!.tag} | Case #${totalCases}`,
			});
			await this.message.guild!.members.unban(
				this.member,
				`Softbanned by ${this.message.author!.tag} | Case #${totalCases}`,
			);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys![0]);
			this.client.caseHandler.cachedCases.delete(this.keys![1]);
			throw new Error(`there was an error softbanning this member \`${error.message}\``);
		}

		this.client.settings.set(this.message.guild!, 'caseTotal', totalCases);

		sentMessage.edit(`Successfully softbanned **${this.member.user.tag}**`);
	}
}
