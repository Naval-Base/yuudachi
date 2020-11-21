import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed, Permissions, User } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { DATE_FORMAT_WITH_SECONDS, MESSAGES } from '../../util/constants';

export default class UserInfoCommand extends Command {
	public constructor() {
		super('user', {
			aliases: ['user', 'member', 'user-info'],
			description: {
				content: MESSAGES.COMMANDS.INFO.USER.DESCRIPTION,
				usage: '[member]',
				examples: ['Crawl', '@Crawl', '81440962496172032'],
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					match: 'content',
					type: Argument.union('member', 'string'),
				},
			],
			before: (message) => message.guild?.members.fetch(),
		});
	}

	public addUserDetails(embed: MessageEmbed, user: User): MessageEmbed {
		const sinceCreationFormatted = moment.utc(user.createdAt ?? 0).fromNow();
		const creationFormatted = moment.utc(user.createdAt ?? 0).format(DATE_FORMAT_WITH_SECONDS);
		return embed.setThumbnail(user.displayAvatarURL()).addField(
			`❯ ${user.bot ? 'Bot' : 'User'} Details`,
			stripIndents`
				• ID: \`${user.id}\`
				• Username: \`${user.tag}\`
				• Created: \`${creationFormatted} (UTC)\` (${sinceCreationFormatted})
				• Status: \`${user.presence.status.toUpperCase()}\`
			`,
		);
	}

	public addMemberDetails(embed: MessageEmbed, member: GuildMember): MessageEmbed {
		const sinceJoinFormatted = moment.utc(member.joinedAt ?? 0).fromNow();
		const joinFormatted = moment.utc(member.joinedAt ?? 0).format(DATE_FORMAT_WITH_SECONDS);

		return embed.addField(
			'❯ Member Details',
			stripIndents`
				${member.nickname == undefined /* eslint-disable-line */ ? '• No nickname' : `• Nickname: \`${member.nickname}\``}
				• Roles: ${member.roles.cache.map((roles) => `\`${roles.name}\``).join(', ')}
				• Joined: \`${joinFormatted} (UTC)\` (${sinceJoinFormatted})
				• Activity: \`${member.presence.activities?.[0]?.name ?? 'None'}\`
			`,
		);
	}

	public async exec(message: Message, { member }: { member: GuildMember | string }) {
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setFooter(
				`Requested by ${message.member?.displayName} (${message.author.id})`,
				message.author.displayAvatarURL(),
			);
		if (member instanceof GuildMember) {
			this.addMemberDetails(embed, member);
			this.addUserDetails(embed, member.user);
			return message.util?.send(embed);
		}

		try {
			const user = await this.client.users.fetch(member);
			this.addUserDetails(embed, user);
			return message.util?.send(embed);
		} catch {
			this.exec(message, { member: message.member! });
		}
	}
}
