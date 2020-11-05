import ms from '@naval-base/ms';
import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class AntiraidCommand extends Command {
	public constructor() {
		super('antiraid', {
			aliases: ['antiraid'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.ANTIRAID.DESCRIPTION,
				usage: '<kick|ban> <age> | <disable>',
				examples: ['kick 10h', 'ban 1w', 'disable'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.KICK_MEMBERS],
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'action',
					type: (_, str): string | null => {
						str = str.toLowerCase();
						return ['kick', 'ban', 'disable'].includes(str) ? str : null;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.ANTIRAID.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.ANTIRAID.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'age',
					type: (_, str): number | null => {
						if (!str) return null;
						const duration = ms(str);
						if (!isNaN(duration)) return duration;
						return null;
					},
				},
			],
		});
	}

	public async exec(message: Message, { action, age }: { action: string; age: number }) {
		if (action === 'disable') {
			this.client.settings.delete(message.guild!, SETTINGS.ANTIRAID_MODE);
			this.client.settings.delete(message.guild!, SETTINGS.ANTIRAID_AGE);

			return message.util?.send(MESSAGES.COMMANDS.MOD.ANTIRAID.DISABLED);
		}

		if (!age) {
			return message.util?.send(MESSAGES.COMMANDS.MOD.ANTIRAID.NO_AGE);
		}

		this.client.settings.set(message.guild!, SETTINGS.ANTIRAID_MODE, action.toUpperCase());
		this.client.settings.set(message.guild!, SETTINGS.ANTIRAID_AGE, age);

		return message.util?.send(MESSAGES.COMMANDS.MOD.ANTIRAID.ENABLED(action, ms(age, true)));
	}
}
