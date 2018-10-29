const Scheduler = require('./Scheduler');
const { Op } = require('sequelize');

class MuteScheduler extends Scheduler {
	constructor(client, model, { checkRate = 5 * 60 * 1000 } = {}) {
		super(client, model, { checkRate });
	}

	async addMute(mute) {
		mute = await this.model.create(mute, { returning: true });
		if (mute.action_duration.getTime() < (Date.now() + this.checkRate)) {
			this.queueMute(mute);
		}
	}

	async cancelMute(mute) {
		const member = this.client.guilds.get(mute.guild).members.get(mute.target_id);
		mute.update({ action_processed: true });
		if (member) await member.roles.remove('506409290400137216', `Unmuted automatically based on duration.`);
		super.cancelSchedule(mute.id);
	}

	deleteMute(id) {
		super.deleteSchedule(id);
	}

	queueMute(mute) {
		this.queuedSchedules.set(mute.id, setTimeout(() => {
			this.cancelMute(mute);
		}, mute.action_duration.getTime() - Date.now()));
	}

	async init() {
		await this.check();
		this.checkInterval = setInterval(this.check.bind(this), this.checkRate);
	}

	async check() {
		const mutes = await this.model.findAll({
			where: {
				action_duration: { [Op.lt]: new Date(Date.now() + this.checkRate) },
				action_processed: false
			}
		});
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

module.exports = MuteScheduler;
