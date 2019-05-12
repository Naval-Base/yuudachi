import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class DeleteConfigCommand extends Command {
	public constructor() {
		super('config-delete', {
			description: {
				content: 'Deletes a value to the config.',
				usage: '<key>'
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
				['config-del-cases', 'cases'],
				['config-del-mod', 'modRole', 'mod', 'mod-role'],
				['config-del-modlog', 'modLogChannel', 'modlog', 'modchan', 'mod-channel'],
				['config-del-muted', 'muteRole', 'muted', 'mute-role'],
				['config-del-repo', 'githubRepository', 'repo', 'repository'],
				['config-del-restrict', 'restrictRoles', 'restrict', 'restrict-roles']
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

		Flag.continue(key);
	}
}
