import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class CasesCommand extends Command {
	public constructor() {
		super('cases', {
			aliases: ['cases'],
			description: {
				content: stripIndents`Available methods:
					 • show \`<number>\`
					 • delete \`<number>\`

					Required: \`<>\` | Optional: \`[]\`
				`,
				usage: '<method> <...arguments>'
			},
			category: 'mod',
			channel: 'guild',
			ratelimit: 2
		});
	}

	// @ts-ignore
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public *args(): object {
		const method = yield {
			type: [
				['case-show', 'case', 'show', 'view'],
				['case-delete', 'delete', 'del', 'remove', 'rm']
			],
			otherwise: (msg: Message): string => {
				// @ts-ignore
				const prefix = this.handler.prefix(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help cases\` for more information.
				`;
			}
		};

		return Flag.continue(method);
	}
}
