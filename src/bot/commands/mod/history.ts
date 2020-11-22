import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import UserInfoCommand from '../info/user';

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
					match: 'phrase',
					type: Argument.union('member', 'string'),
					default: (message: Message) => message.member,
				},
				{
					id: 'showProfile',
					match: 'flag',
					flag: ['--profile', '-p'],
				},
			],
			flags: ['--profile', '-p'],
			before: (message) => message.guild?.members.fetch(),
		});
	}

	public async exec(message: Message, { member, showProfile }: { member: GuildMember | string; showProfile: boolean }) {
		const staffRole = message.member?.roles.cache.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE));
		if (!staffRole) return;

		const userInfoCmd = this.handler.findCommand('user') as UserInfoCommand;

		if (member instanceof GuildMember) {
			const embed = await this.client.caseHandler.history(member);
			if (showProfile) {
				userInfoCmd.addMemberDetails(embed, member);
				userInfoCmd.addUserDetails(embed, member.user);
			}
			return message.util?.send(embed);
		}

		try {
			const user = await this.client.users.fetch(member);
			const embed = await this.client.caseHandler.history(user);
			if (showProfile) {
				userInfoCmd.addUserDetails(embed, user);
			}
			return message.util?.send(embed);
		} catch {}
	}
}
