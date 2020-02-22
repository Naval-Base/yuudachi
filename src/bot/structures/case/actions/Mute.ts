import { TextChannel, User } from 'discord.js';
import { ACTIONS, MESSAGES, PRODUCTION, SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { Cases, CasesInsertInput } from '../../../util/graphQLTypes';
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
		const guild = this.message.guild!;
		const staff = this.client.settings.get(guild, SETTINGS.MOD_ROLE);
		if (this.member.roles.cache.has(staff ?? '')) {
			throw new Error(MESSAGES.ACTIONS.NO_STAFF);
		}

		const muteRole = this.client.settings.get(guild, SETTINGS.MUTE_ROLE);
		if (!muteRole) throw new Error(MESSAGES.ACTIONS.NO_MUTE);

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
		const muteRole = this.client.settings.get(guild, SETTINGS.MUTE_ROLE)!;

		const sentMessage = await this.message.channel.send(MESSAGES.ACTIONS.MUTE.PRE_REPLY(this.member.user.tag));

		try {
			await this.member.roles.add(muteRole, MESSAGES.ACTIONS.MUTE.AUDIT(this.message.author.tag, totalCases));
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(this.keys as string);
			throw new Error(MESSAGES.ACTIONS.MUTE.ERROR(error.message));
		}

		this.client.settings.set(guild, SETTINGS.CASES, totalCases);

		sentMessage.edit(MESSAGES.ACTIONS.MUTE.REPLY(this.member.user.tag));
	}

	public async after() {
		const guild = this.message.guild!;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0);
		const memberTag = this.member instanceof User ? this.member.tag : this.member.user.tag;
		await this.client.muteScheduler.add({
			guild: guild.id,
			caseId: totalCases,
			targetId: this.member.id,
			targetTag: memberTag,
			muteMessage: this.message.id,
			modId: this.message.author.id,
			modTag: this.message.author.tag,
			action: this.action,
			reason: this.reason,
			refId: this.ref,
			actionDuration: new Date(Date.now() + (this.duration ?? 0)).toISOString(),
			actionProcessed: false,
		});

		const modLogChannel = this.client.settings.get(guild, SETTINGS.MOD_LOG);
		if (modLogChannel) {
			const { data } = await graphQLClient.query<any, CasesInsertInput>({
				query: GRAPHQL.QUERY.LOG_CASE,
				variables: {
					guild: guild.id,
					caseId: totalCases,
				},
			});
			let dbCase: Pick<Cases, 'id' | 'message'>;
			if (PRODUCTION) dbCase = data.cases[0];
			else dbCase = data.casesStaging[0];
			if (dbCase) {
				const embed = (
					await this.client.caseHandler.log({
						member: this.member,
						action: this.actionName,
						caseNum: totalCases,
						reason: this.reason,
						message: this.message,
						duration: this.duration,
						ref: this.ref,
						nsfw: this.nsfw,
					})
				).setColor(this.color);
				try {
					const modMessage = await (this.client.channels.cache.get(modLogChannel) as TextChannel).send(embed);
					await graphQLClient.mutate({
						mutation: GRAPHQL.MUTATION.LOG_CASE,
						variables: {
							id: dbCase.id,
							message: modMessage.id,
						},
					});
				} catch (error) {
					this.client.logger.error(error.message);
				}
			}
		}
	}
}
