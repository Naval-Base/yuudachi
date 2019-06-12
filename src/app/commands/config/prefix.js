const { Command, Argument } = require('discord-akairo');

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			channel: 'guild',
			description: {
				content: 'Displays or changes the prefix of the guild.',
				usage: '<prefix>',
				examples: ['', '?', '!']
			}
		});
	}

	*args(message) {
		const phrase = yield { match: 'content' };
		const permission = message.member.permissions.has('MANAGE_GUILD');
		const prefix = yield (
			permission && phrase
				? {
					type: Argument.validate('string', (msg, phrase) => !/\s/.test(phrase) && phrase.length <= 3),
					prompt: {
						retry: 'please provide a prefix without spaces and less than 3 characters.'
					}
				}
				: { match: 'none', default: false }
		);

		return { prefix };
	}

	exec(message, { prefix }) {
		if (!prefix) return message.util.reply(`current prefix for this guild is \`${this.handler.prefix(message)}\``);
		this.client.settings.set(message.guild, 'prefix', prefix);
		if (prefix === this.handler.prefix(message)) {
			return message.util.reply(`the prefix has been reset to \`${prefix}\``);
		}
		return message.util.reply(`the prefix has been set to \`${prefix}\``);
	}
}

module.exports = PrefixCommand;
