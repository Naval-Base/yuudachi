const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');
require('moment-duration-format');

class NPMCommand extends Command {
	constructor() {
		super('npm', {
			aliases: ['npm', 'npm-package'],
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Responds with information on an NPM package.',
				usage: '<query>',
				examples: ['discord.js', 'discord-akairo', 'node-fetch']
			},
			args: [
				{
					id: 'pkg',
					prompt: {
						start: 'what would you like to search for?'
					},
					match: 'content',
					type: (msg, pkg) => pkg ? encodeURIComponent(pkg.toLocaleLowerCase().replace(/ /g, '-')) : null
				}
			]
		});
	}

	async exec(message, { pkg }) {
		const res = await fetch(`https://registry.npmjs.com/${pkg}`);
		if (res.status === 404) {
			return message.util.reply('I couldn\'t find the requested information.');
		}
		const body = await res.json();
		if (body.time === undefined) {
			return message.util.reply('commander of this package decided to unpublish it.');
		}
		const version = body.versions[body['dist-tags'].latest];
		const maintainers = this._trimArray(body.maintainers.map(user => user.name).join(', '));
		const dependencies = version.dependencies ? this._trimArray(Object.keys(version.dependencies)) : '';
		const embed = new MessageEmbed()
			.setColor(0xCB0000)
			.setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
			.setTitle(body.name)
			.setURL(`https://www.npmjs.com/package/${pkg}`)
			.setDescription(body.description || 'No description.')
			.addField('Version', body['dist-tags'].latest, true)
			.addField('License', body.license || 'None', true)
			.addField('Author', body.author ? body.author.name : '???', true)
			.addField('Creation Date', moment.utc(body.time.created).format('MMMM D, YYYY, kk:mm:ss'), true)
			.addField('Modification Date', moment.utc(body.time.modified).format('MMMM D, YYYY, kk:mm:ss'), true)
			.addField('Main File', version.main || 'index.js', true)
			.addField('Dependencies', dependencies && dependencies.length ? dependencies.join(', ') : 'None')
			.addField('Maintainers', maintainers);

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

	_trimArray(arr) {
		if (arr.length > 10) {
			const len = arr.length - 10;
			arr = arr.slice(0, 10);
		}
		return arr;
	}
}

module.exports = NPMCommand;
