import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { DATE_FORMAT_WITH_SECONDS, MESSAGES } from '../../util/constants';

interface HumanLevels {
	[key: string]: string;
}

const HUMAN_LEVELS: HumanLevels = {
	NONE: 'None',
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: '(╯°□°）╯︵ ┻━┻',
	VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻',
};

export default class GuildInfoCommand extends Command {
	public constructor() {
		super('guild', {
			aliases: ['guild', 'server', 'server-info'],
			description: {
				content: MESSAGES.COMMANDS.INFO.SERVER.DESCRIPTION,
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guild = message.guild!;
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`Info about **${guild.name}** (ID: ${guild.id})`)
			.addField(
				'❯ Channels',
				stripIndents`
				• ${guild.channels.cache.filter((ch) => ch.type === 'text').size} Text, ${
					guild.channels.cache.filter((ch) => ch.type === 'voice').size
				} Voice
				• AFK: ${guild.afkChannelID ? `<#${guild.afkChannelID}> after ${guild.afkTimeout / 60}min` : 'None'}
			`,
			)
			.addField(
				'❯ Member',
				stripIndents`
				• ${guild.memberCount} members
				• Owner: ${guild.owner!.user.tag} (ID: ${guild.ownerID})
			`,
			)
			.addField(
				'❯ Other',
				stripIndents`
				• Roles: ${guild.roles.cache.size}
				• Region: ${guild.region}
				• Created at: ${moment.utc(guild.createdAt).format(DATE_FORMAT_WITH_SECONDS)}
				• Verification Level: ${HUMAN_LEVELS[guild.verificationLevel]}
			`,
			)
			.setThumbnail(guild.iconURL() ?? '');

		return message.util?.send(embed);
	}
}
