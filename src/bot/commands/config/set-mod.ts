import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetConfigModRoleCommand extends Command {
	public constructor() {
		super('config-set-mod', {
			description: {
				content: 'Sets the mod role many of the commands use for permission checking.',
				usage: '<role>',
				examples: ['@Mod', 'Mods']
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'role',
					match: 'content',
					type: 'role'
				}
			]
		});
	}

	public async exec(message: Message, { role }: { role: Role }) {
		this.client.settings.set(message.guild!, 'modRole', role.id);
		return message.util!.reply(`set moderation role to **${role.name}**`);
	}
}
