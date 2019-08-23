import { Command, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			description: {
				content: 'Displays or changes the prefix of the guild.',
				usage: '[prefix]',
				examples: ['*', 'Yukikaze']
			},
			category: 'util',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'prefix',
					type: 'string'
				}
			]
		});
	}

	public async exec(message: Message, { prefix }: { prefix: string }): Promise<Message | Message[]> {
		if (!prefix) return message.util!.send(`The current prefix for this guild is: \`${(this.handler.prefix as PrefixSupplier)(message)}\``);
		this.client.settings.set(message.guild!, 'prefix', prefix);
		if (prefix === process.env.COMMAND_PREFIX) {
			return message.util!.reply(`the prefix has been reset to \`${prefix}\``);
		}
		return message.util!.reply(`the prefix has been set to \`${prefix}\``);
	}
}
