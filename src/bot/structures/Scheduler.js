const EventEmitter = require('events');
const { Op } = require('sequelize');

class Scheduler extends EventEmitter {
	constructor(client, model, { checkRate = 5 * 60 * 1000 } = {}) {
		super();
		this.client = client;
		this.model = model;
		this.checkRate = checkRate;
		this.queuedReminders = new Map();
	}

	async addReminder(reminder) {
		reminder = await this.model.create(reminder, { returning: true });
		if (reminder.triggers_at.getTime() < (Date.now() + this.checkRate)) {
			this.queueReminder(reminder);
		}
	}

	cancelReminder(id) {
		const reminder = this.queuedReminders.get(id);
		if (reminder) clearTimeout(reminder);
		return this.queuedReminders.delete(id);
	}

	deleteReminder(id) {
		this.cancelReminder(id);
		return this.model.destroy({ where: { id } });
	}

	queueReminder(reminder) {
		this.queuedReminders.set(reminder.id, setTimeout(() => {
			this.runReminder(reminder);
		}, reminder.triggers_at.getTime() - Date.now()));
	}

	async runReminder(reminder) {
		try {
			const reason = reminder.reason || `${reminder.channel ? 'y' : 'Y'}ou wanted me to remind you around this time!`;
			const content = `${reminder.channel ? `<@${reminder.user}>, ` : ''} ${reason}\n\n<${reminder.trigger}>`;
			const channel = reminder.channel && this.client.channels.get(reminder.channel);

			if (channel) {
				await channel.send(content);
			} else {
				const user = await this.client.users.fetch(reminder.user);
				if (!this.client.shard || this.client.shard.id === 0) await user.send(content);
			}
		} catch (error) {
			this.emit('error', error);
		}

		try {
			await this.deleteReminder(reminder.id);
		} catch (error) {
			this.emit('error', error);
		}
	}

	async init() {
		await this.check();
		this.checkInterval = setInterval(this.check.bind(this), this.checkRate);
	}

	async check() {
		const reminders = await this.model.findAll({
			where: {
				triggers_at: { [Op.lt]: new Date(Date.now() + this.checkRate) }
			}
		});
		const now = new Date();

		for (const reminder of reminders) {
			if (this.queuedReminders.has(reminder.id)) continue;

			if (reminder.triggers_at < now) {
				this.runReminder(reminder);
			} else {
				this.queueReminder(reminder);
			}
		}
	}
}

module.exports = Scheduler;
