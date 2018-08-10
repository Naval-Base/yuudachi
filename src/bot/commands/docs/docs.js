const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const qs = require('querystring');

class DocsCommand extends Command {
	constructor() {
		super('docs', {
			aliases: ['docs'],
			description: {
				content: 'Searches discord.js documentation.',
				usage: '<query>',
				examples: ['TextChannel', 'Client', 'ClientUser#setActivity master']
			},
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'query',
					match: 'content',
					type: 'lowercase',
					prompt: {
						start: message => `${message.author}, what would you like to search?`
					}
				}
			]
		});
	}

	async exec(message, { query }) {
		query = query.split(' ');
		let project = 'main';
		let branch = ['stable', 'master', 'rpc', 'commando'].includes(query.slice(-1)[0]) ? query.pop() : 'stable';
		if (['rpc', 'commando'].includes(branch)) {
			project = branch;
			branch = 'master';
		}
		const queryString = qs.stringify({ q: query.join(' ') });
		const res = await fetch(`https://djsdocs.sorta.moe/${project}/${branch}/embed?${queryString}`);
		const embed = await res.json();
		if (!embed) return message.util.reply("couldn't find the requested information in the documentation.");
		if (
			!message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS') ||
			!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')
		) { return message.util.send({ embed }); }
		const msg = await message.util.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 5000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first().message.delete();

		return message;
	}
}

module.exports = DocsCommand;
