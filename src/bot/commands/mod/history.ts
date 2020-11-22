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
				usage: '<member> [--profile] [--cases]',
				examples: ['@Crawl', '@Crawl --profile', '81440962496172032 --cases'],
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
				{
					id: 'showCases',
					match: 'flag',
					flag: ['--cases', '-c'],
				},
			],
			flags: ['--profile', '-p'],
			before: (message) => message.guild?.members.fetch(),
		});
	}

	public async exec(
		message: Message,
		{ member, showProfile, showCases }: { member: GuildMember | string; showProfile: boolean; showCases: boolean },
	) {
		const staffRole = message.member?.roles.cache.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE));
		if (!staffRole) return;

		const userInfoCmd = this.handler.findCommand('user') as UserInfoCommand;

		if (member instanceof GuildMember) {
			const embed = await this.client.caseHandler.history(member, showCases);
			if (showProfile) {
				userInfoCmd.addMemberDetails(embed, member);
				userInfoCmd.addUserDetails(embed, member.user);
				embed.thumbnail = null;
			}
			return message.util?.send(embed);
		}

		try {
			const user = await this.client.users.fetch(member);
			const embed = await this.client.caseHandler.history(user, showCases);
			if (showProfile) {
				userInfoCmd.addUserDetails(embed, user);
				embed.thumbnail = null;
			}
			return message.util?.send(embed);
		} catch {
			return message.util?.send(MESSAGES.COMMANDS.MOD.HISTORY.NO_USER);
		}
	}
}
