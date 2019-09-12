import { TextChannel, User } from 'discord.js';
import { ACTIONS } from '../../../util';
import Action, { ActionData } from './Action';

type MuteData = Omit<ActionData, 'days'>;

export default class MuteAction extends Action {
	public constructor(data: MuteData) {
		super(ACTIONS.MUTE, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error('you have to provide a valid user on this guild.');
		}
		const staff = this.client.settings.get<string>(this.message.guild!, 'modRole', undefined);
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error('nuh-uh! You know you can\'t do this.');
		}

		const muteRole = this.client.settings.get<string>(this.message.guild!, 'muteRole', undefined);
		if (!muteRole) throw new Error('there is no mute role configured on this server.');

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0) + 1;
		const muteRole = this.client.settings.get<string>(this.message.guild!, 'muteRole', undefined);

		const sentMessage = await this.message.channel.send(`Muting **${this.member.user.tag}**...`);

		try {
			await this.member.roles.add(muteRole, `Muted by ${this.message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(`there was an error muting this member \`${error.message}\``);
		}

		this.client.settings.set(this.message.guild!, 'caseTotal', totalCases);

		sentMessage.edit(`Successfully muted **${this.member.user.tag}**`);
	}

	public async after() {
		const totalCases = this.client.settings.get<number>(this.message.guild!, 'caseTotal', 0);
		const memberTag = this.member instanceof User
			? this.member.tag
			: this.member.user.tag;
		await this.client.muteScheduler.add({
			guild: this.message.guild!.id,
			case_id: totalCases,
			target_id: this.member.id,
			target_tag: memberTag,
			mod_id: this.message.author!.id,
			mod_tag: this.message.author!.tag,
			action: this.action,
			reason: this.reason,
			action_duration: new Date(Date.now() + this.duration!),
			action_processed: false
		});

		const modLogChannel = this.client.settings.get<string>(this.message.guild!, 'modLogChannel', undefined);
		if (modLogChannel) {
			const dbCase = await this.client.caseHandler.repo.findOne({ case_id: totalCases });
			if (dbCase) {
				const embed = (
					await this.client.caseHandler.log({
						member: this.member,
						action: this.actionName,
						caseNum: totalCases,
						reason: this.reason,
						message: this.message,
						ref: this.ref
					})
				).setColor(this.color);
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
