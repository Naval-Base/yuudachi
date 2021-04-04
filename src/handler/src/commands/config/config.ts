import { injectable, inject } from 'tsyringe';
import type { APIGuildInteraction } from 'discord-api-types/v8';
import type { Sql } from 'postgres';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';
import { CommandModules, TransformedInteraction } from '@yuudachi/types';

import Command from '../../Command';
import { addFields, has, send } from '../../util';
import type { GuildSettings } from '../../interfaces/GuildSettings';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Config;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: APIGuildInteraction, _: TransformedInteraction, locale: string) {
		const [settings] = await this.sql<[GuildSettings?]>`
			select *
			from guild_settings
			where guild_id = ${message.guild_id}`;

		if (!settings) {
			throw new Error(i18next.t('command.config.common.errors.no_settings', { lng: locale }));
		}

		const embed = addFields(
			{},
			{
				name: 'Config',
				value: has(settings.modules, CommandModules.Config) ? '`✅`' : '`❌`',
			},
			{
				name: 'Utility',
				value: has(settings.modules, CommandModules.Utility) ? '`✅`' : '`❌`',
			},
			{
				name: 'Moderation',
				value: has(settings.modules, CommandModules.Moderation) ? '`✅`' : '`❌`',
			},
			{
				name: 'Tags',
				value: has(settings.modules, CommandModules.Tags) ? '`✅`' : '`❌`',
			},
		);

		void send(message, { embed });
	}
}
