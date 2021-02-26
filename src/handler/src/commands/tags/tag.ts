import { injectable, inject } from 'tsyringe';
import { APIMessage } from 'discord-api-types/v8';
import { Args, joinTokens } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';

import { search } from './sub/search';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Tags;

	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: APIMessage, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const sub = args.single();
		if (!sub) {
			throw new Error(i18next.t('command.tag.common.errors.no_name', { lng: locale }));
		}

		switch (sub) {
			case 'search': {
				return search(message, args, locale);
			}

			default: {
				const token = [{ raw: sub, value: sub, trailing: ' ' }];
				const name = joinTokens(token.concat(args.many()));
				if (!name.length) {
					throw new Error(i18next.t('command.tag.common.errors.no_name', { lng: locale }));
				}

				const [tag] = await this.sql<{ content: string }[]>`
					select content
					from tags
					where name = ${name}
						or ${name} = ANY(aliases)
						and guild_id = ${message.guild_id};`;
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (!tag) {
					throw new Error(i18next.t('command.tag.common.errors.not_found', { lng: locale }));
				}
				void this.rest.post(`/channels/${message.channel_id}/messages`, { content: tag.content });
				break;
			}
		}
	}
}
