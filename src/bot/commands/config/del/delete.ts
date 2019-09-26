import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES } from '../../../util/constants';

export default class DeleteConfigCommand extends Command {
	public constructor() {
		super('config-delete', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.DELETE.DESCRIPTION,
				usage: '<key>',
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public *args() {
		const key = yield {
			type: [
				['config-del-cases', 'cases'],
				['config-del-guildlog', 'guildlog', 'guild-log', 'log', 'logs'],
				['config-del-memberlog', 'memberlog', 'member-log', 'member'],
				['config-del-mod', 'modRole', 'mod', 'mod-role'],
				['config-del-modlog', 'modLogChannel', 'modlog', 'modchan', 'mod-channel'],
				['config-del-mute', 'muteRole', 'mute', 'mute-role'],
				['config-del-repo', 'githubRepository', 'repo', 'repository'],
				['config-del-restrict', 'restrictRoles', 'restrict', 'restrict-roles'],
			],
			otherwise: (msg: Message): string => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.CONFIG.DELETE.REPLY(prefix);
			},
		};

		return Flag.continue(key);
	}
}
