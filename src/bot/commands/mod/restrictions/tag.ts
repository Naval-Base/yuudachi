import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import TagAction from '../../../structures/case/actions/Tag';

export default class RestrictTagCommand extends Command {
	public constructor() {
		super('restrict-tag', {
			category: 'mod',
			description: {
				content: 'Restrict a members ability to create/edit/delete/download/list/search tags.',
				usage: '<member> [--ref=number] [...reason]'
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to restrict?`,
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
		const key = `${message.guild!.id}:${member.id}:TAG`;
		try {
			await new TagAction({
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
