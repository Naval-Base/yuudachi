import { TextChannel, User } from 'discord.js';
import { ACTIONS, MESSAGES, SETTINGS } from '../../../util/constants';
import Action, { ActionData } from './Action';

type MuteData = Omit<ActionData, 'days'>;

export default class MuteAction extends Action {
	public constructor(data: MuteData) {
		super(ACTIONS.MUTE, data);
	}

	public async before() {
		if (this.member instanceof User) {
			throw new Error(MESSAGES.ACTIONS.INVALID_MEMBER);
		}
		const staff = this.client.settings.get<string>(this.message.guild!, SETTINGS.MOD_ROLE, undefined);
		if (this.member.roles && this.member.roles.has(staff)) {
			throw new Error(MESSAGES.ACTIONS.NO_STAFF);
		}

		const muteRole = this.client.settings.get<string>(this.message.guild!, SETTINGS.MUTE_ROLE, undefined);
		if (!muteRole) throw new Error(MESSAGES.ACTIONS.NO_MUTE);

		if (this.client.caseHandler.cachedCases.has(this.keys as string)) {
			throw new Error(MESSAGES.ACTIONS.CURRENTLY_MODERATED);
		}
		this.client.caseHandler.cachedCases.add(this.keys as string);

		return true;
	}

	public async exec() {
		if (this.member instanceof User) return;
		const totalCases = this.client.settings.get<number>(this.message.guild!, SETTINGS.CASES, 0) + 1;
		const muteRole = this.client.settings.get<string>(this.message.guild!, SETTINGS.MUTE_ROLE, undefined);

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.MUTE.PRE_REPLY(this.member.user.tag));

		try {
			await this.member.roles.add(muteRole, MESSAGES.ACTIONS.MUTE.AUDIT(this.message.author!.tag, totalCases));
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.MUTE.ERROR(error.message));
		}

		this.client.settings.set(this.message.guild!, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.MUTE.REPLY(this.member.user.tag));
	}

	public async after() {
		const totalCases = this.client.settings.get<number>(this.message.guild!, SETTINGS.CASES, 0);
		const memberTag = this.member instanceof User ? this.member.tag : this.member.user.tag;
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
			action_processed: false,
		});

		const modLogChannel = this.client.settings.get<string>(this.message.guild!, SETTINGS.MOD_LOG, undefined);
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
