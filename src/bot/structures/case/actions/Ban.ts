import { Message, User, GuildMember } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type BanData = Omit<ActionData, 'duration'>;

export default class BanAction extends Action {
	public constructor(data: BanData) {
		super(ACTIONS.BAN, data);
	}

	public async before() {
		const staff = this.client.settings.get(this.message.guild!, SETTINGS.MOD_ROLE);
		if (this.member instanceof GuildMember && this.member.roles.cache.has(staff ?? '')) {
			throw new Error(MESSAGES.ACTIONS.NO_STAFF);
		}

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error(MESSAGES.ACTIONS.CURRENTLY_MODERATED);
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		const embed = await this.client.caseHandler.history(this.member);
		await this.message.channel.send(MESSAGES.ACTIONS.BAN.AWAIT_MESSAGE, { embed });
		const responses = await this.message.channel.awaitMessages(
			(msg: Message) => msg.author.id === this.message.author.id,
			{
				max: 1,
				time: 10000,
			},
		);

		if (responses?.size !== 1) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.BAN.TIMEOUT);
		}
		const response = responses.first();

		if (/^y(?:e(?:a|s)?)?$/i.test(response?.content ?? '')) {
			return true;
		}

		this.client.caseHandler.cachedCases.delete(this.keys as string);
		throw new Error(MESSAGES.ACTIONS.BAN.CANCEL);
	}

	public async exec() {
		const user = this.member instanceof User ? this.member : this.member.user;
		const guild = this.message.guild!;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0) + 1;

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.BAN.PRE_REPLY(user.tag));

		try {
			try {
				await this.member.send(MESSAGES.ACTIONS.BAN.MESSAGE(guild.name, this._reason));
			} catch {}
			await guild.members.ban(user.id, {
				days: this.days,
				reason: MESSAGES.ACTIONS.BAN.AUDIT(this.message.author.tag, totalCases),
			});
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.BAN.ERROR(error.message));
		}

		this.client.settings.set(guild, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.BAN.REPLY(user.tag));
	}
}
