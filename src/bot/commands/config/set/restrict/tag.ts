import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetConfigRestrictRolesTagCommand extends Command {
	public constructor() {
		super('config-set-restrict-tag', {
			description: {
				content: 'Sets the restriction role for tags of the guild.',
				usage: '<Role/RoleId>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					type: 'role',
					prompt: {
						start: (message: Message) => `${message.author}, what role should act as the tag restricted role?`,
						retry: (message: Message) => `${message.author}, please mention a proper role to be the tag restricted role.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { tag }: { tag: Role }) {
		const roles = this.client.settings.get<{ tag: string }>(message.guild!, 'restrictRoles', {});
		roles.tag = tag.id;
		this.client.settings.set(message.guild!, 'restrictRoles', roles);
		return message.util!.reply(`set restricted role for tags to **${tag.name}**`);
	}
}
