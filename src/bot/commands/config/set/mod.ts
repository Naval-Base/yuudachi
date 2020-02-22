import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigModRoleCommand extends Command {
	public constructor() {
		super('config-set-mod', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.MOD.DESCRIPTION,
				usage: '<role>',
				examples: ['@Mod', 'Mods'],
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'role',
					match: 'content',
					type: 'role',
				},
			],
		});
	}

	public async exec(message: Message, { role }: { role: Role }) {
		this.client.settings.set(message.guild!, SETTINGS.MOD_ROLE, role.id);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.MOD.REPLY(role.name));
	}
}
