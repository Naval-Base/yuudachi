import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetConfigRestrictRolesEmbedCommand extends Command {
	public constructor() {
		super('config-set-restrict-embed', {
			description: {
				content: 'Sets the restriction role for embeds of the guild.',
				usage: '<Role/RoleId>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'embed',
					type: 'role',
					prompt: {
						start: (message: Message): string => `${message.author}, what role should act as the embed restricted role?`,
						retry: (message: Message): string => `${message.author}, please mention a proper role to be the embed restricted role.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { embed }: { embed: Role }): Promise<Message | Message[]> {
		const roles = this.client.settings.get(message.guild!, 'restrictRoles', {});
		roles.embed = embed.id;
		this.client.settings.set(message.guild!, 'restrictRoles', roles);
		return message.util!.reply(`set restricted role for embeds to **${embed.name}**`);
	}
}
