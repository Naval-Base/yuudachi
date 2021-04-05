import { injectable, inject } from 'tsyringe';
import type { APIGuildInteraction } from 'discord-api-types';
import type { Sql } from 'postgres';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';
import type { TransformedInteraction } from '@yuudachi/interactions';

import Command from '../../Command';
import { send } from '../../util';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Tags;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string) {
		const [tag] = await this.sql<[{ content: string }?]>`
			select content
			from tags
			where name = ${args.tag.name}
				or ${args.tag.name} = ANY(aliases)
				and guild_id = ${message.guild_id};`;

		if (!tag) {
			throw new Error(i18next.t('command.tag.common.errors.not_found', { lng: locale }));
		}

		void send(message, { content: tag.content });
	}
}
