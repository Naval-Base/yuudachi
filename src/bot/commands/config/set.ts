import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class SetConfigCommand extends Command {
	public constructor() {
		super('config-set', {
			description: {
				content: 'Sets a value to the config.',
				usage: '<key> <...arguments>',
				examples: ['.']
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
				['config-set-cases', 'cases'],
				['config-set-mod', 'modRole', 'mod', 'mod-role'],
				['config-set-modlog', 'modLogChannel', 'modlog', 'modchan', 'mod-channel'],
				['config-set-muted', 'muteRole', 'muted', 'mute-role'],
				['config-set-repo', 'githubRepository', 'repo', 'repository'],
				['config-set-restrict', 'restrictRoles', 'restrict', 'restrict-roles']
			],
			otherwise: (msg: Message): string => {
				// @ts-ignore
				const prefix = this.handler.prefix(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help config\` for more information.
				`;
			}
		};

		return Flag.continue(key);
	}
}
