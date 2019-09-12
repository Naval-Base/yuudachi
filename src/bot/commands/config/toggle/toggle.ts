import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ToggleCommand extends Command {
	public constructor() {
		super('toggle', {
			aliases: ['toggle'],
			description: {
				content: stripIndents`Available keys:
					 • logs \`<webhook>\`
					 • mod
					 • rolestate
					 • tokenfiltering

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
				['toggle-role-state', 'role', 'rolestate', 'role-state'],
				['toggle-token-filtering', 'tokenfiltering', 'token']
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help toggle\` for more information.
				`;
			}
		};

		return Flag.continue(method);
	}
}
