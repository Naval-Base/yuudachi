import { stripIndents } from 'common-tags';
import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

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

	public *args() {
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
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help config\` for more information.
				`;
			}
		};

		return Flag.continue(key);
	}
}
