import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { Reminder } from '../../models/Reminders';
import { MESSAGES } from '../../util/constants';
const ms = require('@naval-base/ms'); // eslint-disable-line

const REMINDER_LIMIT = 15;

export default class ReminderAddCommand extends Command {
	public constructor() {
		super('reminder-add', {
			aliases: ['remind-me'],
			category: 'reminders',
			description: {
				content: MESSAGES.COMMANDS.REMINDERS.ADD.DESCRIPTION,
				usage: '[--dm/--pm] <time> <...reason>',
				examples: [],
			},
			ratelimit: 2,
			args: [
				{
					id: 'time',
					type: (_, str) => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 180000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.REMINDERS.ADD.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.REMINDERS.ADD.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.REMINDERS.ADD.PROMPT_2.START(message.author),
					},
				},
				{
					id: 'dm',
					match: 'flag',
					flag: ['--dm', '--pm'],
				},
			],
		});
	}

	public async exec(message: Message, { time, reason, dm }: { time: number; reason: string; dm: boolean }) {
		const remindersRepo = this.client.db.getRepository(Reminder);
		const reminderCount = await remindersRepo.count({ user: message.author!.id });
		if (reminderCount > REMINDER_LIMIT) {
			return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.ADD.REMINDER_LIMIT(REMINDER_LIMIT));
		}

		if (reason && reason.length >= 1850) {
			return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.ADD.CHARACTER_LIMIT);
		}
		if (!time) {
			return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.ADD.INVALID_TIME_1);
		}
		if (Date.now() + time < Date.now()) {
			return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.ADD.INVALID_TIME_2);
		}
		if (Date.now() + time < Date.now() + 5000) {
			return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.ADD.INVALID_TIME_3);
		}

		await this.client.remindScheduler.add({
			user: message.author!.id,
			channel: message.channel.type === 'dm' || dm ? undefined : message.channel.id,
			reason: Util.cleanContent(reason, message),
			trigger: message.url,
			triggers_at: new Date(Date.now() + time),
		});

		return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.ADD.REPLY(ms(time)));
	}
}
