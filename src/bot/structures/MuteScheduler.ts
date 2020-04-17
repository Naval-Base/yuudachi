import YukikazeClient from '../client/YukikazeClient';
import { PRODUCTION, SETTINGS } from '../util/constants';
import { GRAPHQL, graphQLClient } from '../util/graphQL';
import { Cases, CasesInsertInput, RoleStates, RoleStatesInsertInput } from '../util/graphQLTypes';
import { EVENTS, TOPICS } from '../util/logger';

export default class MuteScheduler {
	private readonly checkRate: number;

	private checkInterval!: NodeJS.Timeout;

	private readonly queued = new Map();

	public constructor(private readonly client: YukikazeClient, { checkRate = 5 * 60 * 1000 } = {}) {
		this.checkRate = checkRate;
	}

	public async add(mute: Omit<Cases, 'id' | 'createdAt'>, reschedule = false) {
		this.client.logger.info(`Muted ${mute.targetTag} on ${this.client.guilds.cache.get(mute.guild)}`, {
			topic: TOPICS.DISCORD_AKAIRO,
			event: EVENTS.MUTE,
		});
		if (reschedule)
			this.client.logger.info(`Rescheduled mute for ${mute.targetTag} on ${this.client.guilds.cache.get(mute.guild)}`, {
				topic: TOPICS.DISCORD_AKAIRO,
				event: EVENTS.MUTE,
			});
		if (!reschedule) {
			const { data } = await graphQLClient.mutate<any, CasesInsertInput>({
				mutation: GRAPHQL.MUTATION.INSERT_CASES,
				variables: {
					action: mute.action,
					actionDuration: mute.actionDuration,
					actionProcessed: mute.actionProcessed,
					caseId: mute.caseId,
					guild: mute.guild,
					message: mute.message,
					muteMessage: mute.muteMessage,
					modId: mute.modId,
					modTag: mute.modTag,
					reason: mute.reason,
					refId: mute.refId,
					targetId: mute.targetId,
					targetTag: mute.targetTag,
				},
			});
			if (PRODUCTION) mute = data.insertCases.returning[0];
			else mute = data.insertCasesStaging.returning[0];
		}
		if (new Date(mute.actionDuration ?? 0).getTime() < Date.now() + this.checkRate) {
			this.queue(mute as Cases);
		}
	}

	public async cancel(mute: Pick<Cases, 'id' | 'guild' | 'targetId' | 'targetTag'>) {
		this.client.logger.info(`Unmuted ${mute.targetTag} on ${this.client.guilds.cache.get(mute.guild)}`, {
			topic: TOPICS.DISCORD_AKAIRO,
			event: EVENTS.MUTE,
		});
		const guild = this.client.guilds.cache.get(mute.guild)!;
		const muteRole = this.client.settings.get(guild, SETTINGS.MUTE_ROLE)!;
		let member;
		try {
			member = await guild.members.fetch(mute.targetId);
		} catch {}
		await graphQLClient.mutate<any, CasesInsertInput>({
			mutation: GRAPHQL.MUTATION.CANCEL_MUTE,
			variables: {
				id: mute.id,
				actionProcessed: true,
			},
		});
		if (member) {
			try {
				await member.roles.remove(muteRole, 'Unmuted automatically based on duration.');
			} catch {}
		} else {
			const { data } = await graphQLClient.query<any, RoleStatesInsertInput>({
				query: GRAPHQL.QUERY.ROLE_STATES,
				variables: {
					guild: mute.guild,
					member: mute.targetId,
				},
			});
			let automaticRoleState: RoleStates;
			if (PRODUCTION) automaticRoleState = data.roleStates[0];
			else automaticRoleState = data.roleStatesStaging[0];

			const muteRole = this.client.settings.get<SETTINGS.MUTE_ROLE, string>(guild, SETTINGS.MUTE_ROLE);
			const roles = automaticRoleState.roles.filter((role) => role !== muteRole);
			if (roles.length) {
				await graphQLClient.mutate({
					mutation: GRAPHQL.MUTATION.UPDATE_ROLE_STATE,
					variables: {
						guild: mute.guild,
						member: mute.targetId,
						roles: `{${roles.join(',')}}`,
					},
				});
			} else {
				await graphQLClient.mutate<any, RoleStatesInsertInput>({
					mutation: GRAPHQL.MUTATION.DELETE_MEMBER_ROLE_STATE,
					variables: {
						guild: mute.guild,
						member: mute.targetId,
					},
				});
			}
		}
		const schedule = this.queued.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		return this.queued.delete(mute.id);
	}

	public async delete(mute: Cases) {
		const schedule = this.queued.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		this.queued.delete(mute.id);
		await graphQLClient.mutate<any, CasesInsertInput>({
			mutation: GRAPHQL.MUTATION.DELETE_CASE,
			variables: {
				id: mute.id,
			},
		});
	}

	public queue(mute: Pick<Cases, 'actionDuration' | 'id' | 'guild' | 'targetId' | 'targetTag'>) {
		this.queued.set(
			mute.id,
			this.client.setTimeout(() => {
				this.cancel(mute);
			}, new Date(mute.actionDuration ?? 0).getTime() - Date.now()),
		);
	}

	public reschedule(mute: Cases) {
		const schedule = this.queued.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		this.queued.delete(mute.id);
		this.add(mute, true);
	}

	public async init() {
		await this.check();
		this.checkInterval = this.client.setInterval(this.check.bind(this), this.checkRate);
	}

	public async check() {
		const { data } = await graphQLClient.query<any, CasesInsertInput>({
			query: GRAPHQL.QUERY.MUTES,
			variables: {
				actionDuration: new Date(Date.now() + this.checkRate).toISOString(),
				actionProcessed: false,
			},
		});
		let mutes: Pick<Cases, 'actionDuration' | 'guild' | 'id' | 'targetId' | 'targetTag'>[];
		if (PRODUCTION) mutes = data.cases;
		else mutes = data.casesStaging;
		const now = Date.now();

		for (const mute of mutes) {
			if (this.queued.has(mute.id)) continue;

			if (new Date(mute.actionDuration ?? 0).getTime() < now) {
				this.cancel(mute);
			} else {
				this.queue(mute);
			}
		}
	}
}
