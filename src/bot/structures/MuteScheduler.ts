import YukikazeClient from '../client/YukikazeClient';
import { LessThan, Repository } from 'typeorm';
import { Case } from '../models/Cases';
import { TOPICS, EVENTS } from '../util/logger';

export default class MuteScheduler {
	protected client: YukikazeClient;

	protected repo: Repository<Case>;

	protected checkRate: number;

	protected checkInterval!: NodeJS.Timeout;

	protected queuedSchedules = new Map();

	public constructor(client: YukikazeClient, repository: Repository<Case>, { checkRate = 5 * 60 * 1000 } = {}) {
		this.client = client;
		this.repo = repository;
		this.checkRate = checkRate;
	}

	public async addMute(mute: Case, reschedule = false): Promise<void> {
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
		if (mute.action_duration.getTime() < (Date.now() + this.checkRate)) {
			this.queueMute(mute);
		}
	}

	public async cancelMute(mute: Case): Promise<boolean> {
		this.client.logger.info(`Unmuted ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.MUTE });
		const guild = this.client.guilds.get(mute.guild);
		const muteRole = this.client.settings.get(guild!, 'muteRole', undefined);
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
		const schedule = this.queuedSchedules.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		return this.queuedSchedules.delete(mute.id);
	}

	public async deleteMute(mute: Case): Promise<Case> {
		const schedule = this.queuedSchedules.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		this.queuedSchedules.delete(mute.id);
		const deleted = await this.repo.remove(mute);
		return deleted;
	}

	public queueMute(mute: Case): void {
		this.queuedSchedules.set(mute.id, this.client.setTimeout((): void => {
			this.cancelMute(mute);
		}, mute.action_duration.getTime() - Date.now()));
	}

	public rescheduleMute(mute: Case): void {
		const schedule = this.queuedSchedules.get(mute.id);
		if (schedule) this.client.clearTimeout(schedule);
		this.queuedSchedules.delete(mute.id);
		this.addMute(mute, true);
	}

	public async init(): Promise<void> {
		await this.check();
		this.checkInterval = this.client.setInterval(this.check.bind(this), this.checkRate);
	}

	public async check(): Promise<void> {
		const mutes = await this.repo.find({ action_duration: LessThan(new Date(Date.now() + this.checkRate)), action_processed: false });
		const now = new Date();

		for (const mute of mutes) {
			if (this.queuedSchedules.has(mute.id)) continue;

			if (mute.action_duration < now) {
				this.cancelMute(mute);
			} else {
				this.queueMute(mute);
			}
		}
	}
}
