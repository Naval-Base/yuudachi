import { Listener } from 'discord-akairo';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { COLORS, SETTINGS } from '../../../util/constants';
import * as moment from 'moment';
import { stripIndents } from 'common-tags';

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
			const joinFormatted = moment.utc(member.joinedAt ?? 0).format();
			const leaveFormatted = moment.utc().format();
			const embed = new MessageEmbed()
				.setColor(COLORS.MEMBER_LEFT)
				.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
				.setFooter('User left')
				.setTimestamp(new Date());

			if (memberlog.MENTION) {
				embed.setDescription(
					stripIndents`
						• Profile: ${member}
						• Joined: ${sinceJoinFormatted} (${joinFormatted})
						• Left: ${leaveFormatted}
					`,
				);
			} else {
				embed.setDescription(
					stripIndents`
						• Joined: ${sinceJoinFormatted} (${joinFormatted})
						• Left: ${leaveFormatted}
					`,
				);
			}

			return (this.client.channels.cache.get(memberlog.ID) as TextChannel).send(embed);
		}
	}
}
