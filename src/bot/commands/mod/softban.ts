import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import SoftbanAction from '../../structures/case/actions/Softban';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class SoftbanCommand extends Command {
	public constructor() {
		super('softban', {
			aliases: ['softban'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.SOFTBAN.DESCRIPTION,
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --days=1 no u', '@Souji --ref=1234 just no'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.SOFTBAN.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.SOFTBAN.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days', '-d'],
					default: 1,
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
		const staffRole = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(
		message: Message,
		{ member, days, ref, reason }: { member: GuildMember; days: number; ref: number; reason: string },
	) {
		const keys = [`${message.guild!.id}:${member.id}:BAN`, `${message.guild!.id}:${member.id}:UNBAN`];
		message.guild!.caseQueue.add(async () =>
			new SoftbanAction({
				message,
				member,
				keys: keys,
				reason,
				ref,
				days,
			}).commit(),
		);
	}
}
