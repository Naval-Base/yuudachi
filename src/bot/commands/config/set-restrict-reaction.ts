import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetConfigRestrictRolesReactionCommand extends Command {
	public constructor() {
		super('config-set-restrict-reaction', {
			description: {
				content: 'Sets the restriction role for reactions of the guild.',
				usage: '<Role/RoleId>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'reaction',
					type: 'role',
					prompt: {
						start: (message: Message): string => `${message.author}, what role should act as the reaction restricted role?`,
						retry: (message: Message): string => `${message.author}, please mention a proper role to be the reaction restricted role.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { reaction }: { reaction: Role }): Promise<Message | Message[]> {
		const roles = this.client.settings.get(message.guild!, 'restrictRoles', {});
		roles.reaction = reaction.id;
		this.client.settings.set(message.guild!, 'restrictRoles', roles);
		return message.util!.reply(`set restricted role for reactions to **${reaction.name}**`);
	}
}
