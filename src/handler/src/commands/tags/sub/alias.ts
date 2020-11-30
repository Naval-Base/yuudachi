import { APIMessage } from 'discord-api-types/v6';
import { Args, joinTokens } from 'lexure';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';

async function checkAliases(name: string, message: APIMessage, locale: string, sql: Sql<any>) {
	const [aliasedTags] = await sql<{ name: string }>`
		select name
		from tags
		where (
			name = ${name}
			or
			aliases @> ${sql.array([name])}
		)
			and guild_id = ${message.guild_id!};`;
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (aliasedTags) {
		throw new Error(i18next.t('command.tag.alias.execute.exists', { name: aliasedTags.name, lng: locale }));
	}
}

async function add(message: APIMessage, args: Args, locale: string, sql: Sql<any>, rest: Rest) {
	const name = args.single();
	if (!name) {
		throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
	}
	const alias = joinTokens(args.many(), ' ', false);
	if (!alias) {
		throw new Error(i18next.t('command.tag.alias.execute.alias_missing', { lng: locale }));
	}

	await checkAliases(alias, message, locale, sql);

	const [updatedTag] = await sql<{ name: string; aliases: string[] }>`
		update tags
		set aliases = array_cat(aliases, ${sql.array([alias])})
		where name = ${name}
			and guild_id = ${message.guild_id!}
		returning name, aliases;`;
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!updatedTag) {
		throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
	}

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: i18next.t('command.tag.alias.execute.aliased', {
			name: updatedTag.name,
			aliases: updatedTag.aliases,
			lng: locale,
		}),
	});
}

async function remove(message: APIMessage, args: Args, locale: string, sql: Sql<any>, rest: Rest) {
	const name = args.single();
	if (!name) {
		throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
	}
	const alias = joinTokens(args.many(), ' ', false);
	if (!alias) {
		throw new Error(i18next.t('command.tag.alias.execute.alias_missing', { lng: locale }));
	}

	const [updatedTag] = await sql<{ name: string; aliases: string[] }>`
		update tags
		set aliases = array_remove(aliases, ${alias})
		where name = ${name}
			and guild_id = ${message.guild_id!}
		returning name, aliases`;
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!updatedTag) {
		throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
	}

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: i18next.t('command.tag.alias.execute.unaliased', {
			name: updatedTag.name,
			aliases: alias,
			lng: locale,
			joinArrays: ', ',
		}),
	});
}

export async function alias(message: APIMessage, args: Args, locale: string, sql: Sql<any>, rest: Rest) {
	const sub = args.single();

	switch (sub) {
		case 'add': {
			return add(message, args, locale, sql, rest);
		}

		case 'rm':
		case 'remove':
		case 'delete': {
			return remove(message, args, locale, sql, rest);
		}

		default:
			throw new Error(i18next.t('command.tag.alias.execute.invalid_subcommand', { lng: locale }));
	}
}
