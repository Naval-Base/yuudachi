import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class RestrictCommand extends Command {
	public constructor() {
		super('restrict', {
			aliases: ['restrict'],
			description: {
				content: MESSAGES.COMMANDS.MOD.RESTRICTIONS.DESCRIPTION,
				usage: '<restriction> <...arguments>',
				examples: [
					'img @Crawl',
					'embed @Crawl img spam',
					'emoji @Dim dumb',
					'reaction @appellation why though',
					'img @Crawl --ref=1234 nsfw',
					'embed @Crawl --ref=1234',
					'tag @Crawl no more!',
					'tag @Souji --ref=1234 no u',
				],
			},
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public *args() {
		const key = yield {
			type: [
				['restrict-embed', 'embed', 'embeds', 'image', 'images', 'img'],
				['restrict-emoji', 'emoji'],
				['restrict-reaction', 'reaction', 'react'],
				['restrict-tag', 'tag'],
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.MOD.RESTRICTIONS.REPLY(prefix);
			},
		};

		return Flag.continue(key);
	}
}
