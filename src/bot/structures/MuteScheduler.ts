import YukikazeClient from '../client/YukikazeClient';
import { LessThan, Repository } from 'typeorm';
import { Case } from '../models/Cases';
import { TOPICS, EVENTS } from '../util/logger';

export default class MuteScheduler {
	private client: YukikazeClient;

	private repo: Repository<Case>;

	private checkRate: number;

	private checkInterval!: NodeJS.Timeout;

	private queued = new Map();

	public constructor(client: YukikazeClient, repository: Repository<Case>, { checkRate = 5 * 60 * 1000 } = {}) {
		this.client = client;
		this.repo = repository;
		this.checkRate = checkRate;
	}

	public async add(mute: Omit<Case, 'id' | 'createdAt'>, reschedule = false) {
		this.client.logger.info(`Muted ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.MUTE });
		if (reschedule) this.client.logger.info(`Rescheduled mute for ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.MUTE });
		if (!reschedule) {
			const cs = new Case();
			cs.guild = mute.guild;
			if (mute.message) cs.message = mute.message;
			cs.case_id = mute.case_id;
			cs.target_id = mute.target_id;
			cs.target_tag = mute.target_tag;
			cs.mod_id = mute.mod_id;
			cs.mod_tag = mute.mod_tag;
			cs.action = mute.action;
			cs.action_duration = mute.action_duration;
			cs.action_processed = mute.action_processed;
			cs.reason = mute.reason;
			mute = await this.repo.save(cs);
		}
		if (mute.action_duration!.getTime() < (Date.now() + this.checkRate)) {
			this.queue(mute as Case);
		}
	}

	public async cancel(mute: Case) {
		this.client.logger.info(`Unmuted ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.MUTE });
		const guild = this.client.guilds.get(mute.guild);
		const muteRole = this.client.settings.get<string>(guild!, 'muteRole', undefined);
		let member;
		try {
			member = await guild!.members.fetch(mute.target_id);
		} catch {}
		mute.action_processed = true;
		await this.repo.save(mute);
		if (member) {
			try {
				await member.roles.remove(muteRole, 'Unmuted automatically based on duration.');
			} catch {}
		}
		const schedule = this.queued.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		return this.queued.delete(mute.id);
	}

	public async delete(mute: Case) {
		const schedule = this.queued.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		this.queued.delete(mute.id);
		const deleted = await this.repo.remove(mute);
		return deleted;
	}

	public queue(mute: Case) {
		this.queued.set(mute.id, this.client.setTimeout(() => {
			this.cancel(mute);
		}, mute.action_duration!.getTime() - Date.now()));
	}

	public reschedule(mute: Case) {
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
		const mutes = await this.repo.find({ action_duration: LessThan(new Date(Date.now() + this.checkRate)), action_processed: false });
		const now = new Date();

		for (const mute of mutes) {
			if (this.queued.has(mute.id)) continue;

			if (mute.action_duration! < now) {
				this.cancel(mute);
			} else {
				this.queue(mute);
			}
		}
	}
}
