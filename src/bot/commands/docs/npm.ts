import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';
import { MESSAGES } from '../../util/constants';

export default class NPMCommand extends Command {
	public constructor() {
		super('npm', {
			aliases: ['npm', 'npm-package'],
			category: 'docs',
			description: {
				content: MESSAGES.COMMANDS.DOCS.NPM.DESCRIPTION,
				usage: '<query>',
				examples: ['discord.js', 'discord-akairo', 'node-fetch'],
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'pkg',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.DOCS.NPM.PROMPT.START(message.author),
					},
					match: 'content',
					type: (_, pkg) => (pkg ? encodeURIComponent(pkg.replace(/ /g, '-')) : null),
				},
			],
		});
	}

	public async exec(message: Message, { pkg }: { pkg: string }) {
		const res = await fetch(`https://registry.npmjs.com/${pkg}`);
		if (res.status === 404) {
			return message.util!.reply(MESSAGES.COMMANDS.DOCS.NPM.FAILURE);
		}
		const body = await res.json();
		if (body.time && body.time.unpublished) {
			return message.util!.reply(MESSAGES.COMMANDS.DOCS.NPM.UNPUBLISH);
		}
		const version = body.versions[body['dist-tags'].latest];
		const maintainers = this._trimArray(body.maintainers.map((user: { name: string }) => user.name));
		const dependencies = version.dependencies ? this._trimArray(Object.keys(version.dependencies)) : null;
		const embed = new MessageEmbed()
			.setColor(0xcb0000)
			.setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
			.setTitle(body.name)
			.setURL(`https://www.npmjs.com/package/${pkg}`)
			.setDescription(body.description || 'No description.')
			.addField('❯ Version', body['dist-tags'].latest, true)
			.addField('❯ License', body.license || 'None', true)
			.addField('❯ Author', body.author ? body.author.name : '???', true)
			.addField('❯ Creation Date', moment.utc(body.time.created).format('YYYY/MM/DD hh:mm:ss'), true)
			.addField('❯ Modification Date', moment.utc(body.time.modified).format('YYYY/MM/DD hh:mm:ss'), true)
			.addField('❯ Main File', version.main || 'index.js', true)
			.addField('❯ Dependencies', dependencies && dependencies.length ? dependencies.join(', ') : 'None')
			.addField('❯ Maintainers', maintainers.join(', '));

		return message.util!.send(embed);
	}

	private _trimArray(arr: string[]) {
		if (arr.length > 10) {
			const len = arr.length - 10;
			arr = arr.slice(0, 10);
			arr.push(`${len} more...`);
		}

		return arr;
	}
}
