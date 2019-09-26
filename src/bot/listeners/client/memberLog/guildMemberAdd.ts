import { Listener } from 'discord-akairo';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { COLORS, SETTINGS } from '../../../util/constants';

export default class GuildMemberAddMemberLogListener extends Listener {
	public constructor() {
		super('guildMemberAddMemberLog', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const memberLog = this.client.settings.get<string>(member.guild, SETTINGS.MEMBER_LOG, undefined);
		if (memberLog) {
			const embed = new MessageEmbed()
				.setColor(COLORS.MEMBER_JOIN)
				.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
				.setFooter('User joined')
				.setTimestamp(new Date());

			return (this.client.channels.get(memberLog) as TextChannel).send(embed);
		}
	}
}
