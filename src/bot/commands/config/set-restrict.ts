import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndent } from 'common-tags';

export default class SetConfigRestrictRolesCommand extends Command {
	public constructor() {
		super('config-set-restrict', {
			description: {
				content: 'Sets the restriction roles of the guild.',
				usage: '<key> <...arguments>'
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2
		});
	}

	public *args(): object {
		const key = yield {
			type: [
				['config-set-restrict-embed', 'embed'],
				['config-set-restrict-emoji', 'emoji'],
				['config-set-restrict-reaction', 'reaction'],
				['config-set-restrict-tag', 'tag']
			],
			otherwise: (msg: Message): string => {
				// @ts-ignore
				const prefix = this.handler.prefix(msg);
				return stripIndent`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help config\` for more information.
				`;
			}
		};

		return Flag.continue(key);
	}
}
