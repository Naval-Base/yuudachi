import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import MuteAction from '../../structures/case/actions/Mute';
const ms = require('@naval-base/ms'); // eslint-disable-line

export default class MuteCommand extends Command {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'mod',
			description: {
				content: 'Mutes a member, duh.',
				usage: '<member> <duration> [--ref=number] [...reason]',
				examples: ['@Crawl 20m', '@Crawl 20m no u', '@Souji 14d --ref=1234 just stop']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to mute?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
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
						start: (message: Message) => `${message.author}, for how long do you want the mute to last?`,
						retry: (message: Message) => `${message.author}, please use a proper time format.`
					}
				},
				{
					id: 'ref',
					type: 'integer',
					match: 'option',
					flag: ['--ref=', '-r=']
				},
				{
					'id': 'reason',
					'match': 'rest',
					'type': 'string',
					'default': ''
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { member, duration, ref, reason }: { member: GuildMember; duration: number; ref: number; reason: string }) {
		if (member.id === message.author!.id) return;
		const key = `${message.guild!.id}:${member.id}:MUTE`;
		try {
			await new MuteAction({
				message,
				member,
				keys: key,
				reason,
				ref,
				duration
			}).commit();
		} catch (error) {
			return message.util!.reply(error.message);
		}
	}
}
