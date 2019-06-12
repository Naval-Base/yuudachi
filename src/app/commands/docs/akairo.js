const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const qs = require('querystring');

class AkairoDocsCommand extends Command {
	constructor() {
		super('akairo-docs', {
			aliases: ['akairo'],
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Searches discord-akairo documentation.',
				usage: '<query>',
				examples: ['CommandUtil', 'CommandHandler#commandStarted']
			},
			args: [
				{
					id: 'query',
					match: 'rest',
					type: 'lowercase',
					prompt: {
						start: 'what would you like to search?'
					}
				},
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f']
				}
			]
		});
	}

	async exec(message, { query, force }) {
		query = query.split(' ');
		const SOURCES = ['akairo', 'akairo-master'];
		const source = SOURCES.includes(query.slice(-1)[0]) ? query.pop() : 'akairo-master';
		const queryString = qs.stringify({ src: source, q: query.join(' '), force });
		const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
		const data = await res.json();
		if (!data) {
			return message.util.reply('I couldn\'t find the requested information.');
		}
		const embed = this.client.util.embed(data);
		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util.send({ embed });
		}
		const msg = await message.util.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 30000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();
			return message;
		}
		react.first().message.delete();
		return message;
	}
}

module.exports = AkairoDocsCommand;
