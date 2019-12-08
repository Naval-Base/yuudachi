import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import TagAction from '../../../structures/case/actions/Tag';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class RestrictTagCommand extends Command {
	public constructor() {
		super('restrict-tag', {
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.RESTRICTIONS.TAG.DESCRIPTION,
				usage: '<member> [--ref=number] [...reason]',
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.RESTRICTIONS.TAG.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.RESTRICTIONS.TAG.PROMPT.RETRY(message.author),
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
		if (member.id === message.author.id) return;
		const guild = message.guild!;
		const key = `${guild.id}:${member.id}:TAG`;
		guild.caseQueue.add(async () =>
			new TagAction({
				message,
				member,
				keys: key,
				reason,
				ref,
			}).commit(),
		);
	}
}
