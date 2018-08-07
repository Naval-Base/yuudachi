const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

class TagCommand extends Command {
	constructor() {
		super('tag', {
			aliases: ['tag'],
			description: {
				content: stripIndents`Available methods:
					 • show \`<tag>\`
					 • add \`[--hoisted] <tag> <content>\`
					 • alias \`<--add/--del> <tag> <tagalias>\`
					 • del \`<tag>\`
					 • edit \`<tag> <content>\`
					 • source \`<tag>\`
					 • info \`<tag>\`
					 • search \`<tag>\`
					 • list \`[member]\`

					Required: \`<>\` | Optional: \`[]\`

					For additional \`<...arguments>\` usage refer to the examples below.
				`,
				usage: '<method> <...arguments>',
				examples: [
					'show Test',
					'add Test Test',
					'add --hoisted "Test 2" Test2',
					'alias --add Test1 Test2',
					'alias --del "Test 2" "Test 3"',
					'del Test',
					'edit Test Some new content',
					'edit "Test 1" Some more new content',
					'source Test',
					'info Test',
					'search Test',
					'list @Crawl'
				]
			},
			category: 'tags',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'method',
					type: ['show', 'add', 'alias', 'del', 'edit', 'source', 'info', 'search', 'list']
				},
				{
					'id': 'name',
					'match': 'rest',
					'default': ''
				}
			]
		});
	}

	exec(message, { method, name }) {
		if (!method) return message.util.send('Use a real command, boi.');
		const command = {
			show: this.handler.modules.get('tag-show'),
			add: this.handler.modules.get('tag-add'),
			alias: this.handler.modules.get('tag-alias'),
			del: this.handler.modules.get('tag-delete'),
			edit: this.handler.modules.get('tag-edit'),
			source: this.handler.modules.get('tag-source'),
			info: this.handler.modules.get('tag-info'),
			search: this.handler.modules.get('tag-search'),
			list: this.handler.modules.get('tag-list')
		}[method];

		return this.handler.handleDirectCommand(message, name, command);
	}
}

module.exports = TagCommand;
