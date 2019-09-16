import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Reminder } from '../../models/Reminders';
import RemindScheduler from '../../structures/RemindScheduler';
import { MESSAGES } from '../../util/constants';

export default class ReminderDeleteCommand extends Command {
	public constructor() {
		super('reminder-delete', {
			category: 'reminders',
			description: {
				content: MESSAGES.COMMANDS.REMINDERS.DELETE.DESCRIPTION,
				usage: '[--all/-a]',
				examples: ['--all'],
			},
			ratelimit: 2,
			args: [
				{
					id: 'all',
					match: 'flag',
					flag: ['--all', '-a'],
				},
			],
		});
	}

	public async exec(message: Message, { all }: { all: boolean }) {
		const remindersRepo = this.client.db.getRepository(Reminder);
		if (all) {
			const reminders = await remindersRepo.find({ user: message.author!.id });
			for (const reminder of reminders) this.client.remindScheduler.cancel(reminder.id);

			const deleted = await remindersRepo.remove(reminders);
			return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.DELETE.REPLY(deleted));
		}

		const reminders = await remindersRepo.find({ user: message.author!.id });
		if (!reminders.length) return message.util!.reply(MESSAGES.COMMANDS.REMINDERS.DELETE.NO_REMINDERS);

		while (reminders.length) {
			await message.util!.send(
				RemindScheduler.embed(message, reminders).setFooter(MESSAGES.COMMANDS.REMINDERS.DELETE.AWAIT_MESSAGE),
			);

			const messages = await message.channel.awaitMessages(
				m =>
					m.author.id === message.author!.id &&
					((m.content > 0 && m.content <= reminders.length) || m.content.toLowerCase() === 'cancel'),
				{ max: 1, time: 20000 },
			);
			if (!messages.size) {
				return message.util!.send(MESSAGES.COMMANDS.REMINDERS.DELETE.TIME_LIMIT);
			}
			if (messages.first()!.content.toLowerCase() === 'cancel') {
				return message.util!.send(MESSAGES.COMMANDS.REMINDERS.DELETE.CANCEL);
			}

			const index = parseInt(messages.first()!.content, 10) - 1;
			const reminder = reminders.splice(index, 1)[0];
			await this.client.remindScheduler.delete(reminder);
		}

		return message.util!.send(MESSAGES.COMMANDS.REMINDERS.DELETE.REPLY_2);
	}
}
