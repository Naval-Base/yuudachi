import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
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
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'textChannel',
				},
				{
					id: 'mention',
					match: 'flag',
					flag: ['--mention', '-m'],
				},
			],
		});
	}

	public async exec(message: Message, { mention, channel }: { mention: boolean; channel: TextChannel }) {
		const guild = message.guild!;
		const memberlog = this.client.settings.get(guild, SETTINGS.MEMBER_LOG, { ID: '', MENTION: false });
		memberlog.ID = channel.id;
		if (mention) memberlog.MENTION = mention;
		this.client.settings.set(guild, SETTINGS.MEMBER_LOG, memberlog);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.MEMBER_LOG.REPLY(channel.name));
	}
}
