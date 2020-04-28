import ms from '@naval-base/ms';
import { TextChannel, User } from 'discord.js';
import YukikazeClient from '../client/YukikazeClient';
import { PRODUCTION } from '../util/constants';
import { GRAPHQL, graphQLClient } from '../util/graphQL';
import { Lockdowns, LockdownsInsertInput } from '../util/graphQLTypes';
import { EVENTS, TOPICS } from '../util/logger';

export default class LockdownScheduler {
	private readonly checkRate: number;

	private checkInterval!: NodeJS.Timeout;

	private readonly queued = new Map();

	public constructor(private readonly client: YukikazeClient, { checkRate = 5 * 60 * 1000 } = {}) {
		this.checkRate = checkRate;
	}

	public async add(lockdown: Omit<Lockdowns, 'id' | 'duration'>, duration: number, author: User) {
		const chan = this.client.channels.cache.get(lockdown.channel) as TextChannel;
		this.client.logger.info(`Lockdown on ${this.client.guilds.cache.get(lockdown.guild)} in ${chan}`, {
			topic: TOPICS.DISCORD_AKAIRO,
			event: EVENTS.LOCKDOWN,
		});
		const { data } = await graphQLClient.mutate<any, LockdownsInsertInput>({
			mutation: GRAPHQL.MUTATION.INSERT_LOCKDOWNS,
			variables: {
				guild: lockdown.guild,
				channel: lockdown.channel,
				duration: new Date(Date.now() + duration).toISOString(),
			},
		});
		if (PRODUCTION) lockdown = data.insertLockdowns.returning[0];
		else lockdown = data.insertLockdownsStaging.returning[0];

		await chan.updateOverwrite(
			lockdown.guild,
			{
				SEND_MESSAGES: false,
				ADD_REACTIONS: false,
			},
			`Lockdown for ${ms(duration)} by ${author.tag}`,
		);
		chan.edit({ name: `🚫${chan.name}` });

		if (new Date((lockdown as Lockdowns).duration).getTime() < Date.now() + this.checkRate) {
			this.queue(lockdown as Lockdowns);
		}
	}

	public async cancel(lockdown: Pick<Lockdowns, 'channel'>) {
		const { data } = await graphQLClient.query<any, LockdownsInsertInput>({
			query: GRAPHQL.QUERY.LOCKDOWNS_CHANNEL,
			variables: {
				channel: lockdown.channel,
			},
		});
		let lock: Lockdowns;
		if (PRODUCTION) lock = data.lockdowns[0];
		else lock = data.lockdownsStaging[0];

		const chan = this.client.channels.cache.get(lockdown.channel) as TextChannel;
		this.client.logger.info(`Lockdown removed on ${this.client.guilds.cache.get(lock.guild)} in ${chan}`, {
			topic: TOPICS.DISCORD_AKAIRO,
			event: EVENTS.LOCKDOWN,
		});
		await graphQLClient.mutate<any, LockdownsInsertInput>({
			mutation: GRAPHQL.MUTATION.CANCEL_LOCKDOWN,
			variables: {
				id: lock.id,
			},
		});

		await chan.updateOverwrite(
			lock.guild,
			{
				SEND_MESSAGES: null,
				ADD_REACTIONS: null,
			},
			`Lockdown removed based on duration.`,
		);
		chan.edit({ name: chan.name.slice(1) });

		const schedule = this.queued.get(lock.id);
		if (schedule) this.client.clearTimeout(schedule);
		return this.queued.delete(lock.id);
	}

	public queue(lockdown: Lockdowns) {
		this.queued.set(
			lockdown.id,
			this.client.setTimeout(() => {
				this.cancel(lockdown);
			}, new Date(lockdown.duration).getTime() - Date.now()),
		);
	}

	public async init() {
		await this.check();
		this.checkInterval = this.client.setInterval(this.check.bind(this), this.checkRate);
	}

	public async check() {
		const { data } = await graphQLClient.query<any, LockdownsInsertInput>({
			query: GRAPHQL.QUERY.LOCKDOWNS_DURATION,
			variables: {
				duration: new Date(Date.now() + this.checkRate).toISOString(),
			},
		});
		let lockdowns: Lockdowns[];
		if (PRODUCTION) lockdowns = data.lockdowns;
		else lockdowns = data.lockdownsStaging;
		const now = Date.now();

		for (const lockdown of lockdowns) {
			if (this.queued.has(lockdown.id)) continue;

			if (new Date(lockdown.duration).getTime() < now) {
				this.cancel(lockdown);
			} else {
				this.queue(lockdown);
			}
		}
	}
}
