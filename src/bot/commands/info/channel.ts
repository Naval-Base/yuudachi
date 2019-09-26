import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { MESSAGES } from '../../util/constants';

export default class ChannelInfoCommand extends Command {
	public constructor() {
		super('channel', {
			aliases: ['channel', 'channel-info'],
			description: {
				content: MESSAGES.COMMANDS.INFO.CHANNEL.DESCRIPTION,
				usage: '[channel]',
				examples: ['#general', 'general', '222197033908436994'],
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'channel',
					default: (message: Message) => message.channel,
				},
			],
		});
	}

	public async exec(message: Message, { channel }: { channel: TextChannel }) {
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`Info about **${channel.name}** (ID: ${channel.id})`)
			.addField(
				'❯ Info',
				stripIndents`
				• Type: ${channel.type}
				• Topic ${channel.topic ? channel.topic : 'None'}
				• NSFW: ${Boolean(channel.nsfw)}
				• Creation Date: ${moment.utc(channel.createdAt).format('YYYY/MM/DD hh:mm:ss')}
			`,
			)
			.setThumbnail(message.guild!.iconURL()!);

		return message.util!.send(embed);
	}
}
