import type { Sql } from 'postgres';
import i18next from 'i18next';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';

import { send } from '../../../util';

const { kSQL } = Tokens;

export async function search(message: any, query: string, locale: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const tags = await sql<[{ name: string; aliases: string[] }]>`
		select name, aliases
		from tags
		where guild_id = ${message.guild_id!}`;

	const filtered = tags.filter((t) => t.name.includes(query) || t.aliases.some((a) => a.includes(query)));
	if (!filtered.length) {
		throw new Error(i18next.t('command.tag.common.errors.not_found', { lng: locale }));
	}

	const results = tags
		.map((tag) => `\`${tag.name}\``)
		.sort()
		.join(', ');
	if (results.length >= 1950) {
		throw new Error(i18next.t('command.tag.search.errors.too_long', { lng: locale }));
	}

	void send(message, { embed: { description: results } });
}
