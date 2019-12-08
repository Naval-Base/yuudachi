import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../../util/constants';

export default class SetConfigRestrictRolesReactionCommand extends Command {
	public constructor() {
		super('config-set-restrict-reaction', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.DESCRIPTION,
				usage: '<Role/RoleId>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'reaction',
					type: 'role',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.PROMPT.RETRY(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { reaction }: { reaction: Role }) {
		const guild = message.guild!;
		const roles = this.client.settings.get(guild, SETTINGS.RESTRICT_ROLES, { REACTION: '' });
		roles.REACTION = reaction.id;
		this.client.settings.set(guild, SETTINGS.RESTRICT_ROLES, roles);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.REPLY(reaction.name));
	}
}
