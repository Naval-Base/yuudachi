import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
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
			userPermissions: ['MANAGE_GUILD'],
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
		const roles = this.client.settings.get<{ EMBED: string }>(message.guild!, SETTINGS.RESTRICT_ROLES, {});
		roles.EMBED = embed.id;
		this.client.settings.set(message.guild!, SETTINGS.RESTRICT_ROLES, roles);
		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.EMBED.REPLY(embed.name));
	}
}
