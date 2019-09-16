import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import UnbanAction from '../../structures/case/actions/Unban';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class UnbanCommand extends Command {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.UNBAN.DESCRIPTION,
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl appealed', '@Souji --ref=1234 appealed', '@Souji --ref=1234'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'user',
					type: async (_, id) => {
						const user = await this.client.users.fetch(id);
						return user;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.UNBAN.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.UNBAN.PROMPT.RETRY(message.author),
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

	public async exec(message: Message, { user, ref, reason }: { user: User; ref: number; reason: string }) {
		if (user.id === message.author!.id) return;
		const key = `${message.guild!.id}:${user.id}:UNBAN`;
		try {
			await new UnbanAction({
				message,
				member: user,
				keys: key,
				reason,
				ref,
			}).commit();
		} catch (error) {
			return message.util!.reply(error.message);
		}
	}
}
