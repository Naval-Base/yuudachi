import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class TagCommand extends Command {
	public constructor() {
		super('tag', {
			aliases: ['tag'],
			description: {
				content: stripIndents`Available methods:
					 • show \`<tag>\`
					 • add \`[--hoist/--pin] <tag> <content>\`
					 • alias \`<--add/--del> <tag> <tagalias>\`
					 • del \`<tag>\`
					 • edit \`[--hoist/--unhoist] <tag> <content>\`
					 • source \`[--file] <tag>\`
					 • info \`<tag>\`
					 • search \`<tag>\`
					 • list \`[member]\`
					 • download \`[member]\`

					Required: \`<>\` | Optional: \`[]\`

					For additional \`<...arguments>\` usage refer to the examples below.
				`,
				usage: '<method> <...arguments>',
				examples: [
					'show Test',
					'add Test Test',
					'add --hoist/--pin "Test 2" Test2',
					'alias --add Test1 Test2',
					'alias --del "Test 2" "Test 3"',
					'del Test',
					'edit Test Some new content',
					'edit "Test 1" Some more new content',
					'edit Test --hoist',
					'edit Test --unhoist Some more new content',
					'source Test',
					'source --file Test',
					'info Test',
					'search Test',
					'list @Crawl',
					'download @Crawl'
				]
			},
			category: 'tags',
			channel: 'guild',
			ratelimit: 2
		});
	}

	public *args(): object {
		const method = yield {
			type: [
				['tag-show', 'show'],
				['tag-add', 'add'],
				['tag-alias', 'alias'],
				['tag-delete', 'del', 'delete'],
				['tag-edit', 'edit'],
				['tag-source', 'source'],
				['tag-info', 'info'],
				['tag-search', 'search'],
				['tag-list', 'list'],
				['tag-download', 'download', 'dl']
			],
			otherwise: (msg: Message): string => {
				// @ts-ignore
				const prefix = this.handler.prefix(msg);
				return stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help tag\` for more information.

					Hmph, you probably wanted to use \`${prefix}tag show\` or something!
				`;
			}
		};

		return Flag.continue(method);
	}
}
