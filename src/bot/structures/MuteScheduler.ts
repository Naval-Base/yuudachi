import { LessThan, Repository } from 'typeorm';
import YukikazeClient from '../client/YukikazeClient';
import { Case } from '../models/Cases';
import { EVENTS, TOPICS } from '../util/logger';

export default class MuteScheduler {
	private readonly checkRate: number;

	private checkInterval!: NodeJS.Timeout;

	private readonly queued = new Map();

	public constructor(
		private readonly client: YukikazeClient,
		private readonly repo: Repository<Case>,
		{ checkRate = 5 * 60 * 1000 } = {},
	) {
		this.checkRate = checkRate;
	}

	public async add(mute: Omit<Case, 'id' | 'createdAt'>, reschedule = false) {
		this.client.logger.info(`Muted ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, {
			topic: TOPICS.DISCORD_AKAIRO,
			event: EVENTS.MUTE,
		});
		if (reschedule)
			this.client.logger.info(`Rescheduled mute for ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, {
				topic: TOPICS.DISCORD_AKAIRO,
				event: EVENTS.MUTE,
			});
		if (!reschedule) {
			mute = this.repo.create({
				guild: mute.guild,
				message: mute.message,
				case_id: mute.case_id,
				target_id: mute.target_id,
				target_tag: mute.target_tag,
				mod_id: mute.mod_id,
				mod_tag: mute.mod_tag,
				action: mute.action,
				action_duration: mute.action_duration,
				action_processed: mute.action_processed,
				reason: mute.reason,
			});
			mute = await this.repo.save(mute);
		}
		if (mute.action_duration!.getTime() < Date.now() + this.checkRate) {
			this.queue(mute as Case);
		}
	}

	public async cancel(mute: Case) {
		this.client.logger.info(`Unmuted ${mute.target_tag} on ${this.client.guilds.get(mute.guild)}`, {
			topic: TOPICS.DISCORD_AKAIRO,
			event: EVENTS.MUTE,
		});
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
		this.queued.set(
			mute.id,
			this.client.setTimeout(() => {
				this.cancel(mute);
			}, mute.action_duration!.getTime() - Date.now()),
		);
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
		const mutes = await this.repo.find({
			action_duration: LessThan(new Date(Date.now() + this.checkRate)),
			action_processed: false,
		});
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
