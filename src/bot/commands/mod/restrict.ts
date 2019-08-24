import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class RestrictCommand extends Command {
	public constructor() {
		super('restrict', {
			aliases: ['restrict'],
			description: {
				content: stripIndents`
					Restrict a members ability to post embeds/use custom emojis/react.

					Available restrictions:
					 • embed \`<member> [--ref=number] [...reason]\`
					 • emoji \`<member> [--ref=number] [...reason]\`
					 • reaction \`<member> [--ref=number] [...reason]\`
					 • tag \`<member> [--ref=number] [...reason]\`

					Required: \`<>\` | Optional: \`[]\`

					For additional \`<...arguments>\` usage refer to the examples below.
				`,
				usage: '<restriction> <...arguments>',
				examples: [
					'img @Crawl',
					'embed @Crawl img spam',
					'emoji @Dim dumb',
					'reaction @appellation why though',
					'img @Crawl --ref=1234 nsfw',
					'embed @Crawl --ref=1234',
					'tag @Crawl no more!',
					'tag @Souji --ref=1234 no u'
				]
			},
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
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
		const key = yield {
			type: [
				['restrict-embed', 'embed', 'embeds', 'image', 'images', 'img'],
				['restrict-emoji', 'emoji'],
				['restrict-reaction', 'reaction', 'react'],
				['restrict-tag', 'tag']
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
