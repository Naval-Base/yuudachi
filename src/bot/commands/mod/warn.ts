import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import WarnAction from '../../structures/case/actions/Warn';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class WarnCommand extends Command {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.WARN.DESCRIPTION,
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --ref=1234 no u', '@Souji --ref=1234'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.WARN.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.WARN.PROMPT.RETRY(message.author),
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
		const staffRole = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { member, ref, reason }: { member: GuildMember; ref: number; reason: string }) {
		if (member.id === message.author!.id) return;
		const key = `${message.guild!.id}:${member.id}:WARN`;
		message.guild!.caseQueue.add(async () =>
			new WarnAction({
				message,
				member,
				keys: key,
				reason,
				ref,
			}).commit(),
		);
	}
}
