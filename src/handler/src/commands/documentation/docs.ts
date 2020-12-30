import { injectable } from 'tsyringe';
import { APIMessage } from 'discord-api-types/v8';
import { Args, joinTokens } from 'lexure';
import Rest from '@yuudachi/rest';
import i18next from 'i18next';
import fetch from 'node-fetch';
import * as qs from 'querystring';

import Command from '../../Command';
import { CommandModules, DOCUMENTATION_SOURCES } from '../../Constants';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Documentation;

	public constructor(private readonly rest: Rest) {}

	public async execute(message: APIMessage, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.config.common.execute.no_guild', { lng: locale }));
		}

		const query = joinTokens(args.many());
		let source = args.option('src') ?? 'stable';
		const force = args.flag('force', 'f');
		const includePrivate = args.flag('private', 'p');
		const q = query.split(' ');

		if (!DOCUMENTATION_SOURCES.includes(source)) {
			throw new Error(i18next.t('command.docs.common.errors.no_matching_source'));
		}
		if (source === 'v11') {
			source = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${source}.json`;
		}
		const queryString = qs.stringify({ src: source, q: q.join(' '), force, includePrivate });
		const embed = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`).then((res) => res.json());
		if (!embed) {
			throw new Error(i18next.t('command.docs.common.errors.no_results'));
		}

		void this.rest.post(`/channels/${message.channel_id}/messages`, { embed });
	}
}
