import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import * as qs from 'querystring';
import { MESSAGES, SETTINGS } from '../../util/constants';

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', 'v11', 'collection'];

interface DocsCommandArguments {
	defaultDocs: string;
	source: string;
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
				examples: ['TextChannel', 'Client', 'ClientUser#setActivity --src=master'],
			},
			category: 'doc',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			flags: ['--force', '-f', '--private', '-p'],
			optionFlags: ['--default=', '--src='],
		});
	}

	public *args() {
		const defaultDocs = yield {
			match: 'option',
			flag: '--default=',
		};

		const source = yield {
			match: 'option',
			flag: '--src=',
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

		return { defaultDocs, source, force, includePrivate, query };
	}

	public async exec(message: Message, { defaultDocs, source, force, includePrivate, query }: DocsCommandArguments) {
		const guild = message.guild!;
		if (defaultDocs) {
			const staff = this.client.settings.get(guild, SETTINGS.MOD_ROLE);
			if (!staff) return;
			const staffRole = message.member?.roles.cache.has(staff);
			if (!staffRole) return message.util?.reply(MESSAGES.COMMANDS.DOCS.DOCS.DEFAULT_DOCS.FAILURE);
			this.client.settings.set(guild, SETTINGS.DEFAULT_DOCS, defaultDocs);
			return message.util?.reply(MESSAGES.COMMANDS.DOCS.DOCS.DEFAULT_DOCS.SUCCESS(defaultDocs));
		}

		const q = query.split(' ');
		if (!SOURCES.includes(source)) {
			source = this.client.settings.get(guild, SETTINGS.DEFAULT_DOCS, 'stable');
		}
		if (source === 'v11') {
			source = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${source}.json`;
		}
		const queryString = qs.stringify({ src: source, q: q.join(' '), force, includePrivate });
		const res = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return message.util?.reply(MESSAGES.COMMANDS.DOCS.DOCS.FAILURE);
		}
		if (
			message.channel.type === 'dm' ||
			!(message.channel as TextChannel).permissionsFor(guild.me ?? '')?.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)
		) {
			return message.util?.send({ embed });
		}
		const msg = await message.util?.send({ embed });
		if (!msg) return message;
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 5000, errors: ['time'] },
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first()?.message.delete();

		return message;
	}
}
