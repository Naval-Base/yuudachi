import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
const ms = require('@naval-base/ms'); // eslint-disable-line

export default class LockdownCommand extends Command {
	public constructor() {
		super('lockdown', {
			aliases: ['lockdown'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.LOCKDOWN.DESCRIPTION,
				usage: '<channel> <duration>',
				examples: ['#general 30m', 'general 2h'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_CHANNELS],
			ratelimit: 2,
			flags: ['--release', '-r'],
		});
	}

	public *args() {
		const channel = yield {
			type: 'channel',
		};

		const release = yield {
			match: 'flag',
			flag: ['--release', '-r'],
		};

		const duration = yield {
			match: 'rest',
			type: (_: Message, str: string) => {
				if (!str) return null;
				const duration = ms(str);
				if (duration && duration >= 300000 && !isNaN(duration)) return duration;
				return null;
			},
			prompt: {
				start: (message: Message) => MESSAGES.COMMANDS.MOD.LOCKDOWN.PROMPT.START(message.author),
				retry: (message: Message) => MESSAGES.COMMANDS.MOD.LOCKDOWN.PROMPT.RETRY(message.author),
				optional: release ? true : false,
			},
		};

		return { release, channel, duration };
	}

	public async exec(
		message: Message,
		{ release, channel, duration }: { release: boolean; channel: TextChannel; duration: number },
	) {
		const guild = message.guild!;
		if (!channel.permissionsFor(guild.id)?.has(Permissions.FLAGS.VIEW_CHANNEL)) {
			return;
		}

		if (release) {
			await this.client.lockdownScheduler.cancel({
				channel: channel.id,
			});

			return message.util?.send(MESSAGES.COMMANDS.MOD.LOCKDOWN.REMOVED(channel));
		}

		await this.client.lockdownScheduler.add(
			{
				guild: guild.id,
				channel: channel.id,
			},
			duration,
			message.author,
		);

		return message.util?.send(MESSAGES.COMMANDS.MOD.LOCKDOWN.REPLY(channel));
	}
}
