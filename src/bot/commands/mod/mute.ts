import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import MuteAction from '../../structures/case/actions/Mute';
import { MESSAGES, SETTINGS } from '../../util/constants';
const ms = require('@naval-base/ms'); // eslint-disable-line

export default class MuteCommand extends Command {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.MUTE.DESCRIPTION,
				usage: '<member> <duration> [--ref=number] [...reason]',
				examples: ['@Crawl 20m', '@Crawl 20m no u', '@Souji 14d --ref=1234 just stop'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.MUTE.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.MUTE.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'duration',
					type: (_, str): number | null => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.MUTE.PROMPT_2.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.MUTE.PROMPT_2.RETRY(message.author),
					},
				},
				{
					id: 'ref',
					type: 'integer',
					match: 'option',
					flag: ['--ref=', '-r='],
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: '',
				},
			],
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE);
		if (!staffRole) return 'No mod role';
		const hasStaffRole = message.member?.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(
		message: Message,
		{ member, duration, ref, reason }: { member: GuildMember; duration: number; ref: number; reason: string },
	) {
		if (member.id === message.author.id) return;
		const guild = message.guild!;
		const key = `${guild.id}:${member.id}:MUTE`;
		guild.caseQueue.add(async () =>
			new MuteAction({
				message,
				member,
				keys: key,
				reason,
				duration,
				ref,
			}).commit(),
		);
	}
}
