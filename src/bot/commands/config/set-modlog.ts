import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';

export default class SetModChannelCommand extends Command {
	public constructor() {
		super('set-modlog', {
			aliases: ['set-modlog', 'modchan', 'mod-channel'],
			description: {
				content: 'Sets the mod log many of the commands use to log moderation actions.',
				usage: '<channel>',
				examples: ['#mod-log', 'mog-log']
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'textChannel'
				}
			]
		});
	}

	public async exec(message: Message, { channel }: { channel: TextChannel }): Promise<Message | Message[]> {
		this.client.settings.set(message.guild!, 'modLogChannel', channel.id);
		return message.util!.reply(`set moderation log channel to **${channel.name}**`);
	}
}
