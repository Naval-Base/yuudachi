const { Command } = require('discord-akairo');

class TagAliasCommand extends Command {
	constructor() {
		super('tag-alias', {
			category: 'tags',
			channel: 'guild',
			flags: ['--add', '--del', '--delete'],
			description: {
				usage: '<--add/--del> <tag> <tag alias>',
				examples: [
					'--add discord.js discordjs',
					'--del "discord akairo" "discord.js akairo"',
					'"discord api" "api discord" --add'
				]
			}
		});
	}

	*args() {
		const tag = yield {
			type: 'findTag',
			prompt: {
				start: 'what\'s the tag you want to alias?',
				retry: (msg, { phrase }) => `a tag with the name **${phrase}** does not exist.`
			}
		};
		const add = yield {
			match: 'flag',
			flag: ['--add']
		};
		const del = yield {
			match: 'flag',
			flag: ['--del', '--delete']
		};
		const alias = yield (
			add
				? {
					match: 'rest',
					type: 'existingTag',
					prompt: {
						start: 'what\'s the alias you want to apply to this tag?',
						retry: (msg, { phrase }) => `a tag with the name **${phrase}** already exists.`
					}
				}
				: {
					match: 'rest',
					type: (msg, phrase) => {
						if (!phrase) return null;
						if (tag.aliases.includes(phrase)) return phrase;
					},
					prompt: {
						start: 'what\'s the alias you want to remove from this tag?',
						retry: (msg, { phrase }) => `a tag alias with the name **${phrase}** doesn't exists.`
					}
				}
		);

		return { tag, alias, add, del };
	}

	async exec(message, { tag, alias, add, del }) {
		const new_alias = await tag.aliases.concat([alias]);

		if (add) {
			if (alias && alias.length >= 256) {
				return message.util.reply('tag names have a limit of 256 characters!');
			}
			await tag.update({ aliases: new_alias, last_modified: message.author.id });
		} else if (del) {
			const removed_alias = await tag.aliases.filter(id => id !== alias);
			await tag.update({ aliases: removed_alias, last_modified: message.author.id });
		} else {
			return message.util.reply('you have to either supply `--add` or `--del`');
		}

		return message.util.reply(`alias **${alias.substring(0, 256)}** ${add ? 'added to' : 'deleted from'} tag **${tag.name}**.`);
	}
}

module.exports = TagAliasCommand;
