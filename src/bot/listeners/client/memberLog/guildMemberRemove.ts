import { Listener } from 'discord-akairo';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { COLORS, DATE_FORMAT_WITH_SECONDS, SETTINGS } from '../../../util/constants';
import * as moment from 'moment';

export default class GuildMemberRemoveMemberLogListener extends Listener {
	public constructor() {
		super('guildMemberRemoveMemberLog', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const memberlog = this.client.settings.get(member.guild, SETTINGS.MEMBER_LOG);
		if (memberlog) {
			const sinceJoinFormatted = moment.utc(member.joinedAt ?? 0).fromNow();
			const joinFormatted = moment.utc(member.joinedAt ?? 0).format(DATE_FORMAT_WITH_SECONDS);
			const leaveFormatted = moment.utc().format(DATE_FORMAT_WITH_SECONDS);
			const embed = new MessageEmbed()
				.setColor(COLORS.MEMBER_LEFT)
				.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
				.setFooter('User left')
				.setTimestamp(new Date());

			const parts = [];

			if (memberlog.MENTION) {
				parts.push(`• Profile: ${member}`);
			}

			if (member.joinedTimestamp) {
				parts.push(`• Joined: \`${joinFormatted}\` (${sinceJoinFormatted})`);
			}

			parts.push(`• Left: \`${leaveFormatted}\``);

			embed.setDescription(parts.join('\n'));

			return (this.client.channels.cache.get(memberlog.ID) as TextChannel).send(embed);
		}
	}
}
