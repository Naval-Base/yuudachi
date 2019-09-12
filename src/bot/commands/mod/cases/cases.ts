import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

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
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public *args() {
		const method = yield {
			type: [
				['case-show', 'case', 'show', 'view'],
				['case-delete', 'delete', 'del', 'remove', 'rm']
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help cases\` for more information.
				`;
			}
		};

		return Flag.continue(method);
	}
}
