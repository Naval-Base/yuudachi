import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { MESSAGES, SETTINGS } from '../../util/constants';

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', '11.5-dev'];

interface DocsCommandArguments {
	defaultDocs: string;
	force: boolean;
	includePrivate: boolean;
	query: string;
}

export default class DocsCommand extends Command {
	public constructor() {
		super('docs', {
			aliases: ['docs'],
			description: {
				content: MESSAGES.COMMANDS.DOCS.DOCS.DESCRIPTION,
				usage: '<query>',
				examples: ['TextChannel', 'Client', 'ClientUser#setActivity master'],
			},
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			flags: ['--force', '-f', '--private', '-p'],
			optionFlags: ['--default='],
		});
	}

	public *args() {
		const defaultDocs = yield {
			match: 'option',
			flag: '--default=',
		};

		const force = yield {
			match: 'flag',
			flag: ['--force', '-f'],
		};

		const includePrivate = yield {
			match: 'flag',
			flag: ['--private', '-p'],
		};

		const query = yield {
			match: 'rest',
			type: 'lowercase',
			prompt: {
				start: (message: Message) => MESSAGES.COMMANDS.DOCS.DOCS.PROMPT.START(message.author),
				optional: defaultDocs ? true : false,
			},
		};

		return { defaultDocs, force, includePrivate, query };
	}

	public async exec(message: Message, { defaultDocs, force, includePrivate, query }: DocsCommandArguments) {
		if (defaultDocs) {
			const staffRole = message.member!.roles.has(
				this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE, undefined),
			);
			if (!staffRole) return message.util!.reply(MESSAGES.COMMANDS.DOCS.DOCS.DEFAULT_DOCS.FAILURE);
			this.client.settings.set(message.guild!, SETTINGS.DEFAULT_DOCS, defaultDocs);
			return message.util!.reply(MESSAGES.COMMANDS.DOCS.DOCS.DEFAULT_DOCS.SUCCESS(defaultDocs));
		}

		const q = query.split(' ');
		const docs = this.client.settings.get<string>(message.guild!, SETTINGS.DEFAULT_DOCS, 'stable');
		let source = SOURCES.includes(q.slice(-1)[0]) ? q.pop() : docs;
		if (source === '11.5-dev') {
			source = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${source}.json`;
		}
		const queryString = qs.stringify({ src: source, q: q.join(' '), force, includePrivate });
		const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return message.util!.reply(MESSAGES.COMMANDS.DOCS.DOCS.FAILURE);
		}
		if (
			message.channel.type === 'dm' ||
			!(message.channel as TextChannel)
				.permissionsFor(message.guild!.me!)!
				.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)
		) {
			return message.util!.send({ embed });
		}
		const msg = await message.util!.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author!.id,
				{ max: 1, time: 5000, errors: ['time'] },
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first()!.message.delete();

		return message;
	}
}
