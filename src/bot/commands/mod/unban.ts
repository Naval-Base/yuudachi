import { Command } from 'discord-akairo';
import { Message, Permissions, User } from 'discord.js';
import UnbanAction from '../../structures/case/actions/Unban';
import { MESSAGES } from '../../util/constants';

export default class UnbanCommand extends Command {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.UNBAN.DESCRIPTION,
				usage: '<member> [--ref=number] [--nsfw] [...reason]',
				examples: ['@Crawl', '@Crawl appealed', '@Souji --ref=1234 appealed', '@Souji --ref=1234'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
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

	public async exec(
		message: Message,
		{ user, ref, nsfw, reason }: { user: User; ref: number; nsfw: boolean; reason: string },
	) {
		if (user.id === message.author.id) return;
		const guild = message.guild!;
		const key = `${guild.id}:${user.id}:UNBAN`;
		guild.caseQueue.add(async () =>
			new UnbanAction({
				message,
				member: user,
				keys: key,
				reason,
				ref,
				nsfw,
			}).commit(),
		);
	}
}
