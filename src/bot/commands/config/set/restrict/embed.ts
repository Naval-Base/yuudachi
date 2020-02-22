import { Command } from 'discord-akairo';
import { Message, Permissions, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../../util/constants';

export default class SetConfigRestrictRolesEmbedCommand extends Command {
	public constructor() {
		super('config-set-restrict-embed', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMBED.DESCRIPTION,
				usage: '<Role/RoleId>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
			args: [
				{
					id: 'embed',
					type: 'role',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMBED.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMBED.PROMPT.RETRY(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { embed }: { embed: Role }) {
		const guild = message.guild!;
		const roles = this.client.settings.get(guild, SETTINGS.RESTRICT_ROLES, { EMBED: '' });
		roles.EMBED = embed.id;
		this.client.settings.set(guild, SETTINGS.RESTRICT_ROLES, roles);
		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMBED.REPLY(embed.name));
	}
}
