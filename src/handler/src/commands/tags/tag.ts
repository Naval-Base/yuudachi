import { injectable, inject } from 'tsyringe';
import { Message } from '@spectacles/types';
import { Args, joinTokens } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';

import Command from '../../Command';
import { kSQL } from '../../tokens';

import { add } from './sub/add';
import { update } from './sub/update';
import { remove } from './sub/remove';
import { alias } from './sub/alias';

@injectable()
export default class implements Command {
	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.tag.common.execute.no_guild', { lng: locale }));
		}

		const sub = args.single();
		switch (sub) {
			case 'add': {
				return add(message, args, locale, this.sql, this.rest);
			}

			case 'update': {
				return update(message, args, locale, this.sql, this.rest);
			}

			case 'rename': {
				return update(message, args, locale, this.sql, this.rest, true);
			}

			case 'rm':
			case 'remove':
			case 'delete': {
				return remove(message, args, locale, this.sql, this.rest);
			}

			case 'alias': {
				return alias(message, args, locale, this.sql, this.rest);
			}

			default: {
				const name = args.many();
				if (!name.length) {
					throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
				}

				const [tag] = await this.sql<{ content: string }>`
					select content
					from tags
					where name = ${joinTokens(name)}
						and guild_id = ${message.guild_id};`;
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (!tag) {
					throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
				}
				void this.rest.post(`/channels/${message.channel_id}/messages`, { content: tag.content });
				break;
			}
		}
	}
}
