import { injectable, inject } from 'tsyringe';
import { Args, joinTokens } from 'lexure';
import type { Sql } from 'postgres';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';
import { send } from '../../util';

import { search } from './sub/search';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Tags;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: any, args: Args, locale: string) {
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

				const [tag] = await this.sql<[{ content: string }?]>`
					select content
					from tags
					where name = ${name}
						or ${name} = ANY(aliases)
						and guild_id = ${message.guild_id};`;

				if (!tag) {
					throw new Error(i18next.t('command.tag.common.errors.not_found', { lng: locale }));
				}

				void send(message, { content: tag.content });
				break;
			}
		}
	}
}
