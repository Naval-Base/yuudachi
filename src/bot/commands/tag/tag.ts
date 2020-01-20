import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../util/constants';

export default class TagCommand extends Command {
	public constructor() {
		super('tag', {
			aliases: ['tag'],
			description: {
				content: MESSAGES.COMMANDS.TAGS.DESCRIPTION,
				usage: '<method> <...arguments>',
				examples: [
					'show Test',
					'add Test Test',
					'add --hoist/--pin "Test 2" Test2',
					'add --template Test1 ${guild}',
					'alias --add Test1 Test2',
					'alias --del "Test 2" "Test 3"',
					'del Test',
					'edit Test Some new content',
					'edit "Test 1" Some more new content',
					'edit Test --hoist',
					'edit Test --unhoist Some more new content',
					'edit Test --template',
					'source Test',
					'source --file Test',
					'info Test',
					'search Test',
					'list @Crawl',
					'download @Crawl',
				],
			},
			category: 'tag',
			channel: 'guild',
			ratelimit: 2,
		});
	}

	public *args() {
		const method = yield {
			type: [
				['tag-show', 'show'],
				['tag-add', 'add'],
				['tag-alias', 'alias'],
				['tag-delete', 'del', 'delete', 'remove', 'rm'],
				['tag-edit', 'edit'],
				['tag-source', 'source'],
				['tag-info', 'info'],
				['tag-search', 'search'],
				['tag-list', 'list'],
				['tag-download', 'download', 'dl'],
			],
			otherwise: (msg: Message) => {
				const prefix = (this.handler.prefix as PrefixSupplier)(msg);
				return MESSAGES.COMMANDS.TAGS.REPLY(prefix);
			},
		};

		return Flag.continue(method);
	}
}
