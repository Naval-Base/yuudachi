import { stripIndents } from 'common-tags';
import { User } from 'discord.js';
import { ACTIONS } from '../../../util';
import Action, { ActionData } from './Action';

type BanData = Omit<ActionData, 'duration'>;

export default class BanAction extends Action {
	public constructor(data: BanData) {
		super(ACTIONS.BAN, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error('you have to provide a valid user on this guild.');
		}
		const staff = this.client.settings.get<string>(this.message.guild!, 'modRole', undefined);
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error('nuh-uh! You know you can\'t do this.');
		}

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		const embed = await this.client.caseHandler.history(this.member);
		await this.message.channel.send('You sure you want me to ban this [no gender specified]?', { embed });
		const responses = await this.message.channel.awaitMessages(msg => msg.author.id === this.message.author!.id, {
			max: 1,
			time: 10000
		});

		if (!responses || responses.size !== 1) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error('timed out. Cancelled ban.');
		}
		const response = responses.first();

		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			return true;
		}

		this.client.caseHandler.cachedCases.delete(this.keys as string);
		throw new Error('cancelled ban.');
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0) + 1;

		const sentMessage = await this.message.channel.send(`Banning **${this.member.user.tag}**...`);

		try {
			try {
				await this.member.send(stripIndents`
					**You have been banned from ${this.message.guild!.name}**
					${this.reason ? `\n**Reason:** ${this.reason}\n` : ''}
					You can appeal your ban by DMing \`Crawl#0002\` with a message why you think you deserve to have your ban lifted.
				`);
			} catch { }
			await this.member.ban({ days: this.days, reason: `Banned by ${this.message.author!.tag} | Case #${totalCases}` });
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(`there was an error banning this member \`${error.message}\``);
		}

		this.client.settings.set(this.message.guild!, 'caseTotal', totalCases);

		sentMessage.edit(`Successfully banned **${this.member.user.tag}**`);
	}
}
