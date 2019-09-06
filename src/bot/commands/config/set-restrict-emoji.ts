import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetConfigRestrictRolesEmojiCommand extends Command {
	public constructor() {
		super('config-set-restrict-emoji', {
			description: {
				content: 'Sets the restriction role for emojis of the guild.',
				usage: '<Role/RoleId>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'emoji',
					type: 'role',
					prompt: {
						start: (message: Message) => `${message.author}, what role should act as the emoji restricted role?`,
						retry: (message: Message) => `${message.author}, please mention a proper role to be the emoji restricted role.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { emoji }: { emoji: Role }) {
		const roles = this.client.settings.get<{ emoji: string }>(message.guild!, 'restrictRoles', {});
		roles.emoji = emoji.id;
		this.client.settings.set(message.guild!, 'restrictRoles', roles);
		return message.util!.reply(`set restricted role for emojis to **${emoji.name}**`);
	}
}
