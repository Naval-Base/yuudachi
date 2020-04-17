import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed, Permissions } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { MESSAGES } from '../../util/constants';

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
					type: 'member',
					default: (message: Message) => message.member,
				},
			],
		});
	}

	public async exec(message: Message, { member }: { member: GuildMember }) {
		const { user } = member;
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`Info about **${user.tag}** (ID: ${member.id})`)
			.addField(
				'❯ Member Details',
				stripIndents`
				${member.nickname == undefined /* eslint-disable-line */ ? '• No nickname' : ` • Nickname: ${member.nickname}`}
				• Roles: ${member.roles.cache.map((roles) => `\`${roles.name}\``).join(' ')}
				• Joined at: ${moment.utc(member.joinedAt ?? 0).format('YYYY/MM/DD hh:mm:ss')}
			`,
			)
			.addField(
				'❯ User Details',
				stripIndents`
				• ID: ${member.id}
				• Username: ${member.user.tag}
				• Created at: ${moment.utc(user.createdAt).format('YYYY/MM/DD hh:mm:ss')}${user.bot ? '\n• Is a bot account' : ''}
				• Status: ${user.presence.status.toUpperCase()}
				• Activity: ${user.presence.activities?.[0]?.name ?? 'None'}
			`,
			)
			.setThumbnail(user.displayAvatarURL());

		return message.util?.send(embed);
	}
}
