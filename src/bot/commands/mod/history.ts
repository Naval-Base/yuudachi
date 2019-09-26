import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class HistoryCommand extends Command {
	public constructor() {
		super('history', {
			aliases: ['history'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.HISTORY.DESCRIPTION,
				usage: '<member>',
				examples: ['@Crawl'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					match: 'content',
					type: Argument.union('member', async (_, phrase) => {
						if (!phrase) return null;
						const m = await this.client.users.fetch(phrase);
						if (m) return { id: m.id, user: m };
						return null;
					}),
					default: (message: Message) => message.member!,
				},
			],
		});
	}

	public async exec(message: Message, { member }: { member: GuildMember }) {
		const staffRole = message.member!.roles.has(
			this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined),
		);
		if (!staffRole && message.author!.id !== member.id) {
			return message.reply(MESSAGES.COMMANDS.MOD.HISTORY.NO_PERMISSION);
		}

		const embed = await this.client.caseHandler.history(member);
		return message.util!.send(embed);
	}
}
