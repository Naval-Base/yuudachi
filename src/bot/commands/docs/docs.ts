import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import * as qs from 'querystring';

const DEFAULTSOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master'];
const EXTENDEDSOURCES = ['11.4-dev', '11.4.2', '11.3.2', '11.2.0', '11.1.0', '11.0.0', '10.0.1', '9.3.1', '9.2.0', '9.1.1', '9.0.2'];

export default class DocsCommand extends Command {
	public constructor() {
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
					match: 'rest',
					type: 'lowercase',
					prompt: {
						start: (message: Message): string => `${message.author}, what would you like to search?`
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

	public async exec(message: Message, { query, force }: { query: string; force: boolean }): Promise<Message | Message[]> {
		const q = query.split(' ');
		const sourceString = query.slice(-1)[0];
		const isExtendedSource = EXTENDEDSOURCES.includes(sourceString);
		let source = DEFAULTSOURCES.includes(sourceString) || isExtendedSource ? query.pop() : 'stable';
		if (isExtendedSource) {
			source = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${source}.json`;
		}
		const queryString = qs.stringify({ src: source, q: q.join(' '), force });
		const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return message.util!.reply("Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!");
		}
		if (message.channel.type === 'dm' || !(message.channel as TextChannel).permissionsFor(message.guild!.me!)!.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util!.send({ embed });
		}
		const msg = await message.util!.send({ embed }) as Message;
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user): boolean => reaction.emoji.name === '🗑' && user.id === message.author!.id,
				{ max: 1, time: 5000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first()!.message.delete();

		return message;
	}
}
