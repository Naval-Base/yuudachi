const { Op } = require('sequelize');
const Case = require('../models/cases');
const Logger = require('../util/logger');

class MuteScheduler {
	constructor(client, { checkRate = 1 * 60 * 1000 } = {}) {
		this.client = client;
		this.checkRate = checkRate;
		this.queued = new Map();
	}

	async addMute(mute, reschedule = false) {
		const guild = this.client.guilds.get(`${mute.guild}`);
		Logger.info(`Muted ${mute.target_tag} on ${guild.name}`, { level: 'MUTE' });
		if (reschedule) {
			const guild = this.client.guilds.get(`${mute.guild}`);
			Logger.info(`Rescheduled mute to ${mute.target_tag} on ${guild.name}`, { level: 'RESCHEDULING MUTE' });
		}

		if (!reschedule) {
			await Case.create({
				case_id: mute.case_id,
				target_id: mute.target_id,
				target_tag: mute.target_tag,
				mod_id: mute.mod_id,
				mod_tag: mute.mod_tag,
				message: mute.message,
				guild: mute.guild,
				action: mute.action,
				action_duration: mute.action_duration,
				action_processed: mute.action_processed,
				reason: mute.reason
			});
		}
		if (mute.action_duration < (Date.now() + this.checkRate)) {
			this.queueMute(mute);
		}
	}

	async cancelMute(mute) {
		const guild = this.client.guilds.get(`${mute.guild}`);
		Logger.info(`Unmuted ${mute.target_tag} on ${guild.name}`, { level: 'UNMUTE' });
		const muteRole = this.client.settings.get(guild, 'muteRole', undefined);

		let member;
		try {
			member = await guild.members.fetch(mute.target_id).catch(() => false);
		} catch {} // eslint-disable-line

		await Case.update({
			action_processed: true
		}, { where: { guild: guild.id, target_id: member.id } });

		if (member) {
			try {
				await member.roles.remove(muteRole, 'Automatic Unmute');
			} catch {} // eslint-disable-line
		}
		const schedule = this.queued.get(mute);
		if (schedule) clearTimeout(schedule);
		return this.queued.delete(mute);
	}

	queueMute(mute) {
		this.queued.set(mute, setTimeout(() => {
			this.cancelMute(mute);
		}, mute.action_duration - Date.now()));
	}

	rescheduleMute(mute) {
		Logger.info('Rescheduling Mute', { level: 'RESCHEDULING MUTE' });
		const schedule = this.queued.get(mute);
		if (schedule) clearTimeout(schedule);
		this.queued.delete(mute);
		this.addMute(mute, true);
	}

	async init() {
		await this._check();
		this.client.setInterval(this._check.bind(this), this.checkRate);
	}

	async _check() {
		const mutes = await Case.findAll({
			where: {
				action_duration: { [Op.lt]: new Date(Date.now() + this.checkRate) },
				action_processed: false, action: 5
			}
		});

		const now = new Date();
		for (const mute of mutes) {
			if (this.queued.has(mute)) continue;
			if (mute.action_duration < now) {
				this.cancelMute(mute);
			} else {
				this.queueMute(mute);
			}
		}
	}
}

module.exports = MuteScheduler;
