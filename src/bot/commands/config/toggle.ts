import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class ToggleCommand extends Command {
	public constructor() {
		super('toggle', {
			aliases: ['toggle'],
			description: {
				content: stripIndents`Available keys:
					 • logs \`<webhook>\`
					 • mod
					 • rolestate

					Required: \`<>\` | Optional: \`[]\`
				`,
				usage: '<method> <...arguments>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public *args(): object {
		const method = yield {
			type: [
				['toggle-logs', 'logs'],
				['toggle-moderation', 'mod', 'moderation'],
				['toggle-role-state', 'role', 'rolestate', 'role-state']
			],
			otherwise: (msg: Message): string => {
				// @ts-ignore
				const prefix = this.handler.prefix(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help toggle\` for more information.
				`;
			}
		};

		return Flag.continue(method);
	}
}
