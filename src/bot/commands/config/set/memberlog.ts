import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigMemberLogCommand extends Command {
	public constructor() {
		super('config-set-memberlog', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.MEMBER_LOG.DESCRIPTION,
				usage: '<channel>',
				examples: ['#member-log', 'member-log'],
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'textChannel',
				},
			],
		});
	}

	public async exec(message: Message, { channel }: { channel: TextChannel }) {
		this.client.settings.set(message.guild!, SETTINGS.MEMBER_LOG, channel.id);
		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.SET.MEMBER_LOG.REPLY(channel.name));
	}
}
