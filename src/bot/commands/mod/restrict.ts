import { Command } from 'discord-akairo';
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

					Required: \`<>\` | Optional: \`[]\`

					For additional \`<...arguments>\` usage refer to the examples below.
				`,
				usage: '<restriction> <...argumens>',
				examples: [
					'img @Crawl',
					'embed @Crawl img spam',
					'emoji @Dim dumb',
					'reaction @appellation why though',
					'img @Crawl --ref=1234 nsfw',
					'embed @Crawl --ref=1234'
				]
			},
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'restriction',
					type: ['embed', 'embeds', 'image', 'images', 'img', 'emoji', 'reaction', 'react']
				},
				{
					'id': 'rest',
					'match': 'rest',
					'default': ''
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { restriction, rest }: { restriction: string; rest: string }): Promise<Message | Message[] | boolean | null> {
		if (!restriction) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			return message.util!.send(stripIndents`
				When you beg me so much I just can't not help you~
				Check \`${prefix}help restrict\` for more information.
			`);
		}
		// eslint-disable-next-line
		const command = ({
			embed: this.handler.modules.get('restrict-embed'),
			embeds: this.handler.modules.get('restrict-embed'),
			image: this.handler.modules.get('restrict-embed'),
			images: this.handler.modules.get('restrict-embed'),
			img: this.handler.modules.get('restrict-embed'),
			emoji: this.handler.modules.get('restrict-emoji'),
			reaction: this.handler.modules.get('restrict-reaction'),
			react: this.handler.modules.get('restrict-reaction')
		} as { [key: string]: Command })[restriction];

		return this.handler.handleDirectCommand(message, rest, command, true);
	}
}
