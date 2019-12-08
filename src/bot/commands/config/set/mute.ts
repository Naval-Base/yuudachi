import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class SetConfigMuteRoleCommand extends Command {
	public constructor() {
		super('config-set-mute', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.MUTE.DESCRIPTION,
				usage: '<role>',
				examples: ['@Muted', 'Muted'],
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
		this.client.settings.set(message.guild!, SETTINGS.MUTE_ROLE, role.id);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.MUTE.REPLY(role.name));
	}
}
