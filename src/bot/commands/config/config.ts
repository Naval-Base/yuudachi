import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class ConfigCommand extends Command {
	public constructor() {
		super('config', {
			aliases: ['config'],
			description: {
				content: stripIndents`Available methods:
					 • set \`<key> <...arguments>\`
					 • delete \`<key>\`
					 • clear

					Available keys:
					 • cases \`<number>\`
					 • mod \`<Role/RoleId>\`
					 • modLog \`<Channel/ChannelId>\`
					 • muted \`<Role/RoleId>\`
					 • repo \`<repository>\`
					 • restrict
					 • • embed \`<Role/RoleId>\`
					 • • emoji \`<Role/RoleId>\`
					 • • reaction \`<Role/RoleId>\`
					 • • tag \`<Role/RoleId>\`

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
				['config-set', 'set'],
				['config-delete', 'delete', 'del', 'remove', 'rm'],
				['config-clear', 'clear']
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

		return Flag.continue(method);
	}
}
