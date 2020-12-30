import { Args } from 'lexure';
import { APIMessage } from 'discord-api-types/v8';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';

const { kSQL } = Tokens;

export async function search(message: APIMessage, args: Args, locale: string) {
	const rest = container.resolve(Rest);
	const sql = container.resolve<Sql<any>>(kSQL);

	const query = args.single();
	if (!query) {
		throw new Error(i18next.t('command.tag.common.errors.no_query', { lng: locale }));
	}

	const tags = await sql<{ name: string; aliases: string[] }>`
		select name, aliases
		from organizational.tags
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

	void rest.post(`/channels/${message.channel_id}/messages`, { embed: { description: results } });
}
