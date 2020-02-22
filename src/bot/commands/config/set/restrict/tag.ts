import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../../util/constants';

export default class SetConfigRestrictRolesTagCommand extends Command {
	public constructor() {
		super('config-set-restrict-tag', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.TAG.DESCRIPTION,
				usage: '<Role/RoleId>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					type: 'role',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.TAG.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.TAG.PROMPT.RETRY(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { tag }: { tag: Role }) {
		const guild = message.guild!;
		const roles = this.client.settings.get(guild, SETTINGS.RESTRICT_ROLES, { TAG: '' });
		roles.TAG = tag.id;
		this.client.settings.set(guild, SETTINGS.RESTRICT_ROLES, roles);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.TAG.REPLY(tag.name));
	}
}
