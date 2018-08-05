const { Command } = require('discord-akairo');
const { cleanContent } = require('../../../util/cleanContent');

class TagAliasCommand extends Command {
	constructor() {
		super('tag-alias', {
			category: 'tags',
			description: {
				usage: '<--add/--del> <tag> <tagalias>',
				examples: ['--add Test1 Test2', '--del "Test 2" "Test 3"', '"Test 3" "Test 4" --add']
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'first',
					type: 'lowercase'
				},
				{
					id: 'second',
					match: 'rest',
					type: 'lowercase'
				},
				{
					id: 'add',
					match: 'flag',
					flag: '--add'
				},
				{
					id: 'del',
					match: 'flag',
					flag: '--del'
				}
			]
		});
	}

	async exec(message, { first, second, add, del }) {
		first = cleanContent(message, first);
		second = cleanContent(message, second);
		const tag = await this.client.db.models.tags.findOne({ where: { name: first, guild: message.guild.id } });
		if (!tag) return message.util.reply(`a tag with the name **${first}** doesn't exists.`);
		if (add) {
			tag.aliases.push(second);
		} else if (del) {
			const index = tag.aliases.indexOf(second);
			tag.aliases.splice(index, 1);
		} else {
			return message.util.reply('you have to either supply `--add` or `--del.`');
		}
		await tag.update({ aliases: tag.aliases });

		return message.util.reply(`alias ${second} ${add ? 'added to' : 'deleted from'} tag ${first}.`);
	}
}

module.exports = TagAliasCommand;
