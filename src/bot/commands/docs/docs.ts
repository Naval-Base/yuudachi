import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import * as qs from 'querystring';

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.4-dev'];

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
			flags: ['--force', '-f'],
			optionFlags: ['--default=']
		});
	}

	public *args(): object {
		const defaultDocs = yield {
			match: 'option',
			flag: '--default='
		};

		const force = yield {
			match: 'flag',
			flag: ['--force', '-f']
		};

		const query = yield {
			match: 'rest',
			type: 'lowercase',
			prompt: {
				start: (message: Message): string => `${message.author}, what would you like to search?`,
				optional: defaultDocs ? true : false
			}
		};

		return { defaultDocs, force, query };
	}

	public async exec(message: Message, { defaultDocs, query, force }: { defaultDocs: string; query: string; force: boolean }): Promise<Message | Message[]> {
		if (defaultDocs) {
			const staffRole = message.member!.roles.has(this.client.settings.get(message.guild!, 'modRole', undefined));
			if (!staffRole) return message.util!.reply('what makes you think you can do that, huh?');
			this.client.settings.set(message.guild!, 'defaultDocs', defaultDocs);
			return message.util!.reply(`set the default docs for this server to ${defaultDocs}`);
		}

		const q = query.split(' ');
		const docs = this.client.settings.get(message.guild!, 'defaultDocs', 'stable');
		let source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : docs;
		if (source === '11.4-dev') {
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
