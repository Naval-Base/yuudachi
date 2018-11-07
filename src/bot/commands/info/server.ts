import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';

const HUMAN_LEVELS = ({
	0: 'None',
	1: 'Low',
	2: 'Medium',
	3: '(╯°□°）╯︵ ┻━┻',
	4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
}) as { [key: number]: string };

export default class ServerInfoCommand extends Command {
	public constructor() {
		super('server', {
			aliases: ['server', 'server-info'],
			description: {
				content: 'Get info on the server.'
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2
		});
	}

	public exec(message: Message) {
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`Info about **${message.guild.name}** (ID: ${message.guild.id})`)
			.addField(
				'❯ Channels',
				stripIndents`
				• ${message.guild.channels.filter(ch => ch.type === 'text').size} Text, ${message.guild.channels.filter(ch => ch.type === 'voice').size} Voice
				• AFK: ${message.guild.afkChannelID ? `<#${message.guild.afkChannelID}> after ${message.guild.afkTimeout / 60}min` : 'None'}
			`
			)
			.addField(
				'❯ Member',
				stripIndents`
				• ${message.guild.memberCount} members
				• Owner: ${message.guild.owner.user.tag} (ID: ${message.guild.ownerID})
			`
			)
			.addField(
				'❯ Other',
				stripIndents`
				• Roles: ${message.guild.roles.size}
				• Region: ${message.guild.region}
				• Created at: ${moment.utc(message.guild.createdAt).format('YYYY/MM/DD hh:mm:ss')}
				• Verification Level: ${HUMAN_LEVELS[message.guild.verificationLevel]}
			`
			)
			.setThumbnail(message.guild.iconURL());

		return message.util!.send(embed);
	}
}
