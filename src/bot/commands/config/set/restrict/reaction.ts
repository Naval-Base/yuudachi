import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../../util/constants';

export default class SetConfigRestrictRolesReactionCommand extends Command {
	public constructor() {
		super('config-set-restrict-reaction', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.DESCRIPTION,
				usage: '<Role/RoleId>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'reaction',
					type: 'role',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.PROMPT.RETRY(message.author)
					}
				}
			]
		});
	}

	public async exec(message: Message, { reaction }: { reaction: Role }) {
		const roles = this.client.settings.get<{ reaction: string }>(message.guild!, SETTINGS.RESTRICT_ROLES, {});
		roles.reaction = reaction.id;
		this.client.settings.set(message.guild!, SETTINGS.RESTRICT_ROLES, roles);
		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.SET.RESTRICT.REACTION.REPLY(reaction.name));
	}
}
