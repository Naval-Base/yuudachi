import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import KickAction from '../../structures/case/actions/Kick';
import { MESSAGES } from '../../util/constants';

export default class KickCommand extends Command {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.KICK.DESCRIPTION,
				usage: '<member> [--ref=number] [--nsfw] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --ref=1234 no u'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.KICK.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.KICK.PROMPT.RETRY(message.author),
					},
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
		{ member, ref, nsfw, reason }: { member: GuildMember; ref: number; nsfw: boolean; reason: string },
	) {
		const guild = message.guild!;
		const key = `${guild.id}:${member.id}:KICK`;
		guild.caseQueue.add(async () =>
			new KickAction({
				message,
				member,
				keys: key,
				reason,
				ref,
				nsfw,
			}).commit(),
		);
	}
}
