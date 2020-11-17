import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message, Permissions, User } from 'discord.js';
import BanAction from '../../structures/case/actions/Ban';
import { MESSAGES } from '../../util/constants';

export default class BanCommand extends Command {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.BAN.DESCRIPTION,
				usage: '<member> [--days=number] [--ref=number] [--nsfw] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --days=1 no u', '@Souji --ref=1234 just no'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: Argument.union('member', 'user', async (_, phrase) => {
						const u = await this.client.users.fetch(phrase);
						return u || null;
					}),
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.BAN.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.BAN.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days=', '-d='],
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
					type: 'string',
					match: 'rest',
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
		}: { member: GuildMember | User; days: number; ref: number; nsfw: boolean; reason: string },
	) {
		days = Math.min(Math.max(days, 0), 7);
		const guild = message.guild!;
		const key = `${guild.id}:${member.id}:BAN`;
		guild.caseQueue.add(async () =>
			new BanAction({
				message,
				member,
				keys: key,
				reason,
				ref,
				days,
				nsfw,
			}).commit(),
		);
	}
}
