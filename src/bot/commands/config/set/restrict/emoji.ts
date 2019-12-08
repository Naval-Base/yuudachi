import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../../util/constants';

export default class SetConfigRestrictRolesEmojiCommand extends Command {
	public constructor() {
		super('config-set-restrict-emoji', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMOJI.DESCRIPTION,
				usage: '<Role/RoleId>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'emoji',
					type: 'role',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMOJI.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMOJI.PROMPT.RETRY(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { emoji }: { emoji: Role }) {
		const guild = message.guild!;
		const roles = this.client.settings.get(guild, SETTINGS.RESTRICT_ROLES, { EMOJI: '' });
		roles.EMOJI = emoji.id;
		this.client.settings.set(guild, SETTINGS.RESTRICT_ROLES, roles);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMOJI.REPLY(emoji.name));
	}
}
