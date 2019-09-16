import { stripIndents } from 'common-tags';
import { User } from 'discord.js';
import { ACTIONS } from '../../../util';
import { SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type KickData = Omit<ActionData, 'days' | 'duration'>;

export default class KickAction extends Action {
	public constructor(data: KickData) {
		super(ACTIONS.KICK, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error('you have to provide a valid user on this guild.');
		}
		const staff = this.client.settings.get<string>(this.message.guild!, SETTINGS.MOD_ROLE, undefined);
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error("nuh-uh! You know you can't do this.");
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, SETTINGS.CASES, 0) + 1;

		const sentMessage = await this.message.channel.send(`Kicking **${this.member.user.tag}**...`);

		try {
			try {
				await this.member.send(stripIndents`
					**You have been kicked from ${this.message.guild!.name}**
					${this.reason ? `\n**Reason:** ${this.reason}\n` : ''}
					You may rejoin whenever.
				`);
			} catch {}
			await this.member.kick(`Kicked by ${this.message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			throw new Error(`there was an error kicking this member \`${error.message}\``);
		}

		this.client.settings.set(this.message.guild!, SETTINGS.CASES, totalCases);

		this.client.caseHandler.cachedCases.delete(this.keys as string);

		sentMessage.edit(`Successfully kicked **${this.member.user.tag}**`);
	}
}
