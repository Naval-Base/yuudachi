const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class NPMCommand extends Command {
	constructor() {
		super('npm', {
			aliases: ['npm', 'npm-package'],
			category: 'docs',
			description: {
				content: 'Responds with information on an NPM package.',
				usage: '<query>',
				examples: ['discord.js', 'discord-akairo', 'node-fetch']
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'pkg',
					prompt: {
						start: message => `${message.author}, what would you like to search for?`
					},
					match: 'content',
					type: pkg => pkg ? encodeURIComponent(pkg.replace(/ /g, '-')) : null
				}
			]
		});
	}

	async exec(msg, { pkg }) {
		const res = await fetch(`https://registry.npmjs.com/${pkg}`);
		if (res.status === 404) return msg.util.send('Could not find any results.');
		const body = await res.json();
		if (body.time.unpublished) return msg.util.send('This package no longer exists.');
		const version = body.versions[body['dist-tags'].latest];
		const maintainers = this.trimArray(body.maintainers.map(user => user.name));
		const dependencies = version.dependencies ? this.trimArray(Object.keys(version.dependencies)) : null;
		const embed = new MessageEmbed()
			.setColor(0xCB0000)
			.setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
			.setTitle(body.name)
			.setURL(`https://www.npmjs.com/package/${pkg}`)
			.setDescription(body.description || 'No description.')
			.addField('❯ Version', body['dist-tags'].latest, true)
			.addField('❯ License', body.license || 'None', true)
			.addField('❯ Author', body.author ? body.author.name : '???', true)
			.addField('❯ Creation Date', new Date(body.time.created).toDateString(), true)
			.addField('❯ Modification Date', new Date(body.time.modified).toDateString(), true)
			.addField('❯ Main File', version.main || 'index.js', true)
			.addField('❯ Dependencies', dependencies && dependencies.length ? dependencies.join(', ') : 'None')
			.addField('❯ Maintainers', maintainers.join(', '));
		return msg.util.send({ embed });
	}

	trimArray(arr) {
		if (arr.length > 10) {
			const len = arr.length - 10;
			arr = arr.slice(0, 10);
			arr.push(`${len} more...`);
		}
		return arr;
	}
};
