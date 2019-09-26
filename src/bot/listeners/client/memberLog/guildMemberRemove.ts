import { Listener } from 'discord-akairo';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { COLORS, SETTINGS } from '../../../util/constants';

export default class GuildMemberRemoveMemberLogListener extends Listener {
	public constructor() {
		super('guildMemberRemoveMemberLog', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const memberLog = this.client.settings.get<string>(member.guild, SETTINGS.MEMBER_LOG, undefined);
		if (memberLog) {
			const embed = new MessageEmbed()
				.setColor(COLORS.MEMBER_LEFT)
				.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
				.setFooter('User left')
				.setTimestamp(new Date());

			return (this.client.channels.get(memberLog) as TextChannel).send(embed);
		}
	}
}
