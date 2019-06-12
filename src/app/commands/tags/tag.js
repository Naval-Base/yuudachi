const { Command } = require('discord-akairo');

class TagCommand extends Command {
	constructor() {
		super('tag', {
			aliases: ['tag'],
			category: 'tags',
			channel: 'guild',
			description: {
				content: [
					'**Available Methods**',
					' • show `<tag>`',
					' • add `[--hoist/--pin] <tag> <content>`',
					' • alias `<--add/--del> <tag> <tagalias>`',
					' • del `<tag>`',
					' • edit `<tag> [--name:/--hoist/--unhoist] <content>`',
					' • source `[--file] <tag>`',
					' • info `<tag>`',
					' • search `<tag>`',
					' • list `[member]`',
					' • download `[member]`',
					'',
					'Required: `<>` | Optional: `[]`',
					'For additional `<...arguments>` usage refer to the examples below.'
				],
				usage: '<method> <...arguments>',
				examples: [
					'show test',
					'add test test',
					'add --hoist/--pin "test name" content',
					'alias --add test content',
					'alias --del "test name" "test content"',
					'del test',
					'edit test some new content',
					'edit "test name" some more new content',
					'edit test --hoist',
					'edit test --unhoist some more new content',
					'discord.js --name:discordjs',
					'discord-akairo --name:"discord akairo"',
					'source test',
					'source --file test',
					'info test',
					'search test',
					'list @Suvajit',
					'download @Suvajit'
				]
			},
			args: [
				{
					id: 'method',
					type: ['show', 'add', 'alias', 'del', 'delete', 'edit', 'source', 'info', 'search', 'list', 'download', 'dl']
				},
				{
					id: 'name',
					match: 'rest',
					default: ''
				}
			]
		});
	}

	exec(message, { method, name }) {
		if (!method) {
			return this.handler.handleDirectCommand(message, 'tag', this.handler.modules.get('help'), true);
		}

		const command = {
			show: this.handler.modules.get('tag-show'),
			add: this.handler.modules.get('tag-add'),
			alias: this.handler.modules.get('tag-alias'),
			del: this.handler.modules.get('tag-delete'),
			delete: this.handler.modules.get('tag-delete'),
			edit: this.handler.modules.get('tag-edit'),
			source: this.handler.modules.get('tag-source'),
			info: this.handler.modules.get('tag-info'),
			search: this.handler.modules.get('tag-search'),
			list: this.handler.modules.get('tag-list'),
			download: this.handler.modules.get('tag-download'),
			dl: this.handler.modules.get('tag-download'),
			stats: this.handler.modules.get('tag-stats')
		}[method];

		return this.handler.handleDirectCommand(message, name, command, true);
	}
}

module.exports = TagCommand;
