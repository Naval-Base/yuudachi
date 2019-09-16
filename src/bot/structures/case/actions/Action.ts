import { PrefixSupplier } from 'discord-akairo';
import { GuildMember, Message, TextChannel, User } from 'discord.js';
import YukikazeClient from '../../../client/YukikazeClient';
import { ACTIONS, COLORS } from '../../../util';

export interface ActionData {
	message: Message;
	member: GuildMember | User;
	keys?: string | string[];
	reason?: string;
	ref?: number;
	days?: number;
	duration?: number;
}

export default abstract class Action {
	protected client: YukikazeClient;

	protected message: Message;

	protected member: GuildMember | User;

	protected keys?: string | string[];

	protected _reason?: string;

	protected ref?: number;

	protected days?: number;

	protected duration?: number;

	public constructor(protected action: ACTIONS, data: ActionData) {
		this.client = data.message.client as YukikazeClient;
		this.message = data.message;
		this.member = data.member;
		this.keys = data.keys;
		this._reason = data.reason;
		this.ref = data.ref;
		this.days = data.days;
		this.duration = data.duration;
	}

	protected get reason() {
		if (this._reason) return this._reason;
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0);
		const prefix = (this.client.commandHandler.prefix as PrefixSupplier)(this.message);
		return `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
	}

	protected get actionName() {
		switch (this.action) {
			case ACTIONS.BAN:
				return 'Ban';
			case ACTIONS.SOFTBAN:
				return 'Softban';
			case ACTIONS.UNBAN:
				return 'Unban';
			case ACTIONS.KICK:
				return 'Kick';
			case ACTIONS.MUTE:
				return 'Mute';
			case ACTIONS.WARN:
				return 'Warn';
			case ACTIONS.EMBED:
				return 'Embed restriction';
			case ACTIONS.EMOJI:
				return 'Emoji restriction';
			case ACTIONS.REACTION:
				return 'Reaction restriction';
			case ACTIONS.TAG:
				return 'Tag restriction';
		}
	}

	protected get color() {
		switch (this.action) {
			case ACTIONS.BAN:
				return COLORS.BAN;
			case ACTIONS.SOFTBAN:
				return COLORS.SOFTBAN;
			case ACTIONS.UNBAN:
				return COLORS.UNBAN;
			case ACTIONS.KICK:
				return COLORS.KICK;
			case ACTIONS.MUTE:
				return COLORS.MUTE;
			case ACTIONS.WARN:
				return COLORS.WARN;
			case ACTIONS.EMBED:
				return COLORS.EMBED;
			case ACTIONS.EMOJI:
				return COLORS.EMOJI;
			case ACTIONS.REACTION:
				return COLORS.REACTION;
			case ACTIONS.TAG:
				return COLORS.TAG;
		}
	}

	public async commit() {
		await this.before();
		await this.exec();
		await this.after();
	}

	public abstract async before(): Promise<boolean>;

	public abstract async exec(): Promise<void>;

	public async after() {
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0);
		const memberTag = this.member instanceof User ? this.member.tag : this.member.user.tag;
		await this.client.caseHandler.create({
			guild: this.message.guild!.id,
			case_id: totalCases,
			target_id: this.member.id,
			target_tag: memberTag,
			mod_id: this.message.author!.id,
			mod_tag: this.message.author!.tag,
			action: this.action,
			reason: this.reason,
		});

		const modLogChannel = this.client.settings.get<string>(this.message.guild!, 'modLogChannel', undefined);
		if (modLogChannel) {
			const dbCase = await this.client.caseHandler.repo.findOne({ case_id: totalCases });
			if (dbCase) {
				const embed = (await this.client.caseHandler.log({
					member: this.member,
					action: this.actionName,
					caseNum: totalCases,
					reason: this.reason,
					message: this.message,
					ref: this.ref,
				})).setColor(this.color);
				try {
					const modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
					dbCase.message = modMessage.id;
					await this.client.caseHandler.repo.save(dbCase);
				} catch (error) {
					this.client.logger.error(error.message);
				}
			}
		}
	}
}
