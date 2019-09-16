import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
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
			userPermissions: ['MANAGE_GUILD'],
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
		const roles = this.client.settings.get<{ tag: string }>(message.guild!, SETTINGS.RESTRICT_ROLES, {});
		roles.tag = tag.id;
		this.client.settings.set(message.guild!, SETTINGS.RESTRICT_ROLES, roles);
		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.TAG.REPLY(tag.name));
	}
}
