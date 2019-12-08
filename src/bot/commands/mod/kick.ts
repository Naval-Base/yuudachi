import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import KickAction from '../../structures/case/actions/Kick';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class KickCommand extends Command {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.KICK.DESCRIPTION,
				usage: '<member> [--ref=number] [...reason]',
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

	public async exec(message: Message, { member, ref, reason }: { member: GuildMember; ref: number; reason: string }) {
		const guild = message.guild!;
		const key = `${guild.id}:${member.id}:KICK`;
		guild.caseQueue.add(async () =>
			new KickAction({
				message,
				member,
				keys: key,
				reason,
				ref,
			}).commit(),
		);
	}
}
