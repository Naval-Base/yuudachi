import { Listener } from 'discord-akairo';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { SETTINGS, MAX_TRUST_ACCOUNT_AGE, DATE_FORMAT_WITH_SECONDS } from '../../../util/constants';
import * as moment from 'moment';
import { stripIndents } from 'common-tags';

function colorFromDuration(duration: number) {
	const percent = Math.min(duration / (MAX_TRUST_ACCOUNT_AGE / 100), 100);
	let r;
	let g;
	let b = 0;

	if (percent < 50) {
		r = 255;
		g = Math.round(5.1 * percent);
	} else {
		g = 255;
		r = Math.round(510 - 5.1 * percent);
	}

	const tintFactor = 0.3;

	r += (255 - r) * tintFactor;
	g += (255 - g) * tintFactor;
	b += (255 - b) * tintFactor;

	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default class GuildMemberAddMemberLogListener extends Listener {
	public constructor() {
		super('guildMemberAddMemberLog', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const memberlog = this.client.settings.get(member.guild, SETTINGS.MEMBER_LOG);
		if (memberlog) {
			const sinceCreationFormatted = moment.utc(member.user.createdAt ?? 0).fromNow();
			const creationFormatted = moment.utc(member.user.createdAt ?? 0).format(DATE_FORMAT_WITH_SECONDS);
			const joinFormatted = moment.utc().format(DATE_FORMAT_WITH_SECONDS);
			const embed = new MessageEmbed()
				.setColor(colorFromDuration(Date.now() - member.user.createdTimestamp))
				.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
				.setFooter('User joined')
				.setTimestamp(new Date());

			if (memberlog.MENTION) {
				embed.setDescription(
					stripIndents`
						• Profile: ${member}
						• Created: ${sinceCreationFormatted} (${creationFormatted})
						• Joined: ${joinFormatted}
					`,
				);
			} else {
				embed.setDescription(
					stripIndents`
						• Created: ${sinceCreationFormatted} (${creationFormatted})
						• Joined: ${joinFormatted}
					`,
				);
			}

			return (this.client.channels.cache.get(memberlog.ID) as TextChannel).send(embed);
		}
	}
}
