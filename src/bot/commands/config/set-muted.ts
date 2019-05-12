import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';

export default class SetConfigMuteRoleCommand extends Command {
	public constructor() {
		super('config-set-muted', {
			description: {
				content: 'Sets the mute role of the guild.',
				usage: '<role>',
				examples: ['@Muted', 'Muted']
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

	public async exec(message: Message, { role }: { role: Role }): Promise<Message | Message[]> {
		this.client.settings.set(message.guild!, 'muteRole', role.id);
		return message.util!.reply(`set mute role to **${role.name}**`);
	}
}
