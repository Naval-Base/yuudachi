import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { LessThan, Repository } from 'typeorm';
import YukikazeClient from '../client/YukikazeClient';
import { Reminder } from '../models/Reminders';
import { EVENTS, TOPICS } from '../util/logger';

export default class RemindScheduler {
	private checkRate: number;

	private checkInterval!: NodeJS.Timeout;

	private queued = new Map();

	public static embed(message: Message, reminders: Reminder[]) {
		const truncate = (str: string, len: number) => str.length > len ? `${str.slice(0, len)}…` : str;
		return new MessageEmbed()
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL())
			.setColor(0x30A9ED)
			.setThumbnail(message.author!.displayAvatarURL())
			.setDescription(reminders.length
				? reminders.sort((a, b) => a.triggers_at.getTime() - b.triggers_at.getTime()).map(
					(reminder, i) => `${i + 1}. ${truncate(reminder.reason || 'reasonless', 30)} \`${reminder.triggers_at.toUTCString()}\`${reminder.channel ? '' : ' (DM)'}`
				).join('\n')
				: 'No reminders');
	}

	public constructor(
		private client: YukikazeClient,
		private repo: Repository<Reminder>,
		{ checkRate = 5 * 60 * 1000 } = {}
	) {
		this.checkRate = checkRate;
	}

	public async add(reminder: Omit<Reminder, 'id'>) {
		const rmd = this.repo.create({
			user: reminder.user,
			channel: reminder.channel,
			reason: reminder.reason,
			trigger: reminder.trigger,
			triggers_at: reminder.triggers_at
		});
		const dbReminder = await this.repo.save(rmd);
		if (dbReminder.triggers_at.getTime() < (Date.now() + this.checkRate)) {
			this.queue(dbReminder);
		}
	}

	public cancel(id: string) {
		const schedule = this.queued.get(id);
		if (schedule) this.client.clearTimeout(schedule);
		return this.queued.delete(id);
	}

	public async delete(reminder: Reminder) {
		const schedule = this.queued.get(reminder.id);
		if (schedule) this.client.clearTimeout(schedule);
		this.queued.delete(reminder.id);
		const deleted = await this.repo.remove(reminder);
		return deleted;
	}

	public queue(reminder: Reminder) {
		this.queued.set(reminder.id, this.client.setTimeout((): void => {
			this.run(reminder);
		}, reminder.triggers_at.getTime() - Date.now()));
	}

	public async run(reminder: Reminder) {
		try {
			const reason = reminder.reason || `${reminder.channel ? 'y' : 'Y'}ou wanted me to remind you around this time!`;
			const content = `${reminder.channel ? `<@${reminder.user}>, ` : ''} ${reason}\n\n<${reminder.trigger}>`;
			const channel = reminder.channel && this.client.channels.get(reminder.channel) as TextChannel;

			if (channel) {
				await channel.send(content);
			} else {
				const user = await this.client.users.fetch(reminder.user);
				await user.send(content);
			}
		} catch (error) {
			this.client.logger.error(error, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.REMINDER });
		}

		try {
			await this.delete(reminder);
		} catch (error) {
			this.client.logger.error(error, { topic: TOPICS.DISCORD_AKAIRO, event: EVENTS.REMINDER });
		}
	}

	public async init() {
		await this._check();
		this.checkInterval = this.client.setInterval(this._check.bind(this), this.checkRate);
	}

	private async _check() {
		const reminders = await this.repo.find({ triggers_at: LessThan(new Date(Date.now() + this.checkRate)) });
		const now = new Date();

		for (const reminder of reminders) {
			if (this.queued.has(reminder.id)) continue;

			if (reminder.triggers_at < now) {
				this.run(reminder);
			} else {
				this.queue(reminder);
			}
		}
	}
}
