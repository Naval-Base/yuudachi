import { inject, injectable } from 'tsyringe';
import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import { Args } from 'lexure';
import { Sql } from 'postgres';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';

import { refresh } from './sub/debug/refresh';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Config;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const [data] = await this.sql<{ mod_role_id: `${bigint}` | null }[]>`
			select mod_role_id
			from guild_settings
			where guild_id = ${message.guild_id}`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!message.member?.roles.includes(data?.mod_role_id ?? ('' as `${bigint}`))) {
			throw new Error(i18next.t('command.common.errors.no_mod_role'));
		}

		const sub = args.single();
		if (!sub) {
			throw new Error(i18next.t('command.common.errors.no_sub_command', { lng: locale }));
		}

		switch (sub) {
			case 'refresh': {
				return refresh(message, args, locale);
			}

			default:
				break;
		}
	}
}
