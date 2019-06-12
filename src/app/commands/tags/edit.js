const { Command } = require('discord-akairo');
const { Util } = require('discord.js');
const moment = require('moment');

class TagEditCommand extends Command {
	constructor() {
		super('tag-edit', {
			category: 'tags',
			channel: 'guild',
			description: {
				content: 'Edit a tag (Markdown can be used).',
				usage: '<tag> [--hoist/--unhoist/--pin/--unpin] <content>',
				examples: [
					'discord.js a powerful node.js module',
					'"discord akairo" a framework for discord.js',
					'discordjs --hoist',
					'"discord akairo" --unpin',
					'discord.js --name:discordjs',
					'discord-akairo --name:"discord akairo"'
				]
			},
			flags: ['--hoist', '--pin', '--unhoist', '--unpin'],
			optionFlags: ['--name:']
		});
	}

	*args() {
		const tag = yield {
			type: 'findTag',
			prompt: {
				start: 'what tag do you want to edit?',
				retry: (msg, { phrase }) => `a tag with the name **${phrase}** does not exist.`
			}
		};
		const name = yield {
			match: 'option',
			flag: '--name:',
			type: 'existingTag',
			prompt: {
				retry: (msg, { phrase }) => `a tag with the name **${phrase}** already exists.`,
				optional: true
			}
		};
		const hoist = yield {
			match: 'flag',
			flag: ['--pin', '--hoist']
		};
		const unhoist = yield {
			match: 'flag',
			flag: ['--unpin', '--unhoist']
		};
		const content = yield (
			hoist || unhoist
				? {
					match: 'rest',
					type: 'tagContent'
				}
				: {
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: 'what should the new content be?',
						optional: name ? true : false
					}
				}
		);
		return { tag, hoist, unhoist, content, name };
	}

	async exec(message, { tag, name, hoist, unhoist, content }) {
		const permission = message.member.permissions.has('MANAGE_GUILD');
		if (tag.author !== message.author.id && !permission) {
			return message.util.reply('you can only edit your own tags.');
		}
		if (content && content.length >= 1950) {
			return message.util.reply('messages have a limit of 2000 characters!');
		}
		if (name && name.length >= 256) {
			return message.util.reply('tag names have a limit of 256 characters!');
		}

		if (name) {
			await tag.update({
				name,
				last_modified: message.author.id,
				updatedAt: moment.utc().toDate()
			});
		}

		if (!name) {
			await tag.update({
				hoisted: (hoist && permission ? true : tag.hoisted) || (unhoist && permission ? false : tag.hoisted),
				content: typeof content === 'string' ? Util.cleanContent(content, message) : tag.content,
				last_modified: message.author.id,
				updatedAt: moment.utc().toDate()
			});
		}

		return message.util.reply([
			`successfully edited ${name ? 'tag name' : ''} **${tag.name}**${!name && hoist && permission ? ' to be hoisted.' : '.'}`
		]);
	}
}

module.exports = TagEditCommand;
