import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigModChannelCommand extends Command {
	public constructor() {
		super('config-set-modlog', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.MOD_LOG.DESCRIPTION,
				usage: '<channel>',
				examples: ['#mod-log', 'mog-log'],
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
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
		this.client.settings.set(message.guild!, SETTINGS.MOD_LOG, channel.id);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.MOD_LOG.REPLY(channel.name));
	}
}
