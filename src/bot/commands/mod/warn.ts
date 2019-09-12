import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import WarnAction from '../../structures/case/actions/Warn';

export default class WarnCommand extends Command {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'mod',
			description: {
				content: 'Warns a user, duh.',
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --ref=1234 no u', '@Souji --ref=1234']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to warn?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
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

	public async exec(message: Message, { member, ref, reason }: { member: GuildMember; ref: number; reason: string }) {
		if (member.id === message.author!.id) return;
		const key = `${message.guild!.id}:${member.id}:WARN`;
		try {
			await new WarnAction({
				message,
				member,
				keys: key,
				reason,
				ref
			}).commit();
		} catch (error) {
			return message.util!.reply(error.message);
		}
	}
}
