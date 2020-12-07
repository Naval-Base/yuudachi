import { injectable, inject } from 'tsyringe';
import { APIMessage } from 'discord-api-types/v6';
import { Args } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';

import Command from '../../Command';
import { CommandModules } from '../../Constants';
import { addFields, has } from '../../util';
import { GuildSettings } from '../../interfaces/GuildSettings';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Config;

	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: APIMessage, _: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.config.common.execute.no_guild', { lng: locale }));
		}

		const [settings] = await this.sql<GuildSettings>`
			select *
			from guild_settings
			where guild_id = ${message.guild_id}`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!settings) {
			throw new Error(i18next.t('command.config.common.execute.no_settings'));
		}

		const embed = addFields(
			{},
			{
				name: 'Config',
				value: has(settings.modules, CommandModules.Config) ? '`✅`' : '`❌`',
			},
			{
				name: 'Moderation',
				value: has(settings.modules, CommandModules.Moderation) ? '`✅`' : '`❌`',
			},
			{
				name: 'Tags',
				value: has(settings.modules, CommandModules.Tags) ? '`✅`' : '`❌`',
			},
			{
				name: 'GitHub',
				value: has(settings.modules, CommandModules.GitHub) ? '`✅`' : '`❌`',
			},
			{
				name: 'Documentation',
				value: has(settings.modules, CommandModules.Documentation) ? '`✅`' : '`❌`',
			},
			{
				name: 'Utility',
				value: has(settings.modules, CommandModules.Utility) ? '`✅`' : '`❌`',
			},
		);

		void this.rest.post(`/channels/${message.channel_id}/messages`, { embed });
	}
}
