import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import SoftbanAction from '../../structures/case/actions/Softban';
import { MESSAGES } from '../../util/constants';

export default class SoftbanCommand extends Command {
	public constructor() {
		super('softban', {
			aliases: ['softban'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.SOFTBAN.DESCRIPTION,
				usage: '<member> [--ref=number] [--nsfw] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --days=1 no u', '@Souji --ref=1234 just no'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
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
					id: 'nsfw',
					match: 'flag',
					flag: ['--nsfw'],
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

	public async exec(
		message: Message,
		{
			member,
			days,
			ref,
			nsfw,
			reason,
		}: { member: GuildMember; days: number; ref: number; nsfw: boolean; reason: string },
	) {
		days = Math.min(Math.max(days, 0), 7);
		const guild = message.guild!;
		const keys = [`${guild.id}:${member.id}:BAN`, `${guild.id}:${member.id}:UNBAN`];
		guild.caseQueue.add(async () =>
			new SoftbanAction({
				message,
				member,
				keys: keys,
				reason,
				ref,
				days,
				nsfw,
			}).commit(),
		);
	}
}
