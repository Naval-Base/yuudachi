import { APIMessage } from 'discord-api-types/v8';
import { Args } from 'lexure';
import type { Sql } from 'postgres';
import i18next from 'i18next';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';

import { ellipsis, send, uniqueValidatedValues } from '../../../util';
import { MESSAGE_CONTENT_LIMIT } from '../../../Constants';

const { kSQL } = Tokens;

const validSubCommands = ['`add`', '`remove`', '`list`'];
const regExp = /([A-Za-z0-9_.-]+):(?:https:\/\/github\.com\/|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;

function argsFormat(locale: string) {
	return i18next.t('command.github.alias.common.alias_format', { lng: locale });
}

async function add(message: APIMessage, locale: string, current: string[], cleaned: string[]) {
	const sql = container.resolve<Sql<any>>(kSQL);

	if (!cleaned.length) {
		throw new Error(
			i18next.t('command.github.alias.add.errors.no_args', {
				format: argsFormat(locale),
				lng: locale,
			}),
		);
	}

	const updated = uniqueValidatedValues([...current, ...cleaned]);

	if (updated.length === current.length) {
		throw new Error(
			i18next.t('command.github.alias.add.no_add', {
				lng: locale,
			}),
		);
	}

	await sql`
		insert into guild_settings(guild_id, repository_aliases)
		values(${message.guild_id!}, ${sql.array(updated)})
		on conflict (guild_id)
		do update set repository_aliases = ${sql.array(updated)};`;

	const added = cleaned.filter((elem) => !current.includes(elem));
	const content = `${i18next.t('command.github.alias.add.title', { lng: locale })}\n${added
		.map((r) => `• \`${r}\``)
		.join('\n')}`;

	void send(message, { content: ellipsis(content, MESSAGE_CONTENT_LIMIT) });
}

async function remove(message: APIMessage, locale: string, current: string[], cleaned: string[]) {
	const sql = container.resolve<Sql<any>>(kSQL);

	if (!cleaned.length) {
		throw new Error(
			i18next.t('command.github.alias.remove.errors.no_args', {
				format: argsFormat(locale),
				lng: locale,
			}),
		);
	}

	if (!current.length) {
		throw new Error(
			i18next.t('command.github.alias.common.errors.no_current', {
				lng: locale,
			}),
		);
	}

	const updated = uniqueValidatedValues(current.filter((elem) => !cleaned.includes(elem)));

	if (updated.length === current.length) {
		throw new Error(
			i18next.t('command.github.alias.remove.no_remove', {
				lng: locale,
			}),
		);
	}

	await sql`
		update guild_settings
		set repository_aliases = ${sql.array(updated)}
		where guild_id = ${message.guild_id!};`;

	const removed = current.filter((elem) => !updated.includes(elem));
	const content = `${i18next.t('command.github.alias.remove.title', { lng: locale })}\n${removed
		.map((r) => `\`${r}\``)
		.join(', ')}`;

	void send(message, { content: ellipsis(content, MESSAGE_CONTENT_LIMIT) });
}

function list(message: APIMessage, locale: string, current: string[]) {
	if (!current.length) {
		throw new Error(
			i18next.t('command.github.alias.common.no_current', {
				lng: locale,
			}),
		);
	}

	const content = `${i18next.t('command.github.alias.list.title', { lng: locale })}\n${current
		.map((r) => `• \`${r}\``)
		.join('\n')}`;

	void send(message, { content: ellipsis(content, MESSAGE_CONTENT_LIMIT) });
}

async function fetchAliases(guild: string, sql: Sql<any>): Promise<string[]> {
	const [result] = await sql<[{ repository_aliases: string[] | null }?]>`
		select repository_aliases
		from guild_settings
		where guild_id = ${guild};`;

	if (!result?.repository_aliases?.length) {
		return [];
	}

	return result.repository_aliases;
}

function resolveAlias(input: string): string | undefined {
	const regex = new RegExp(regExp);
	const match = regex.exec(input.trim());

	if (!match) {
		return undefined;
	}

	const [, alias, repository] = match;
	return `${alias.toLowerCase()}:${repository.toLowerCase()}`;
}

function cleanAliasCandidates(inputs: string[], predicate: (current: string) => boolean | undefined): string[] {
	return inputs.map((i) => resolveAlias(i)).filter((e) => e && predicate(e)) as string[];
}

export async function alias(message: APIMessage, args: Args, locale: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	if (!message.guild_id) {
		throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
	}

	const current = await fetchAliases(message.guild_id, sql);

	const sub = args.single();
	const candidates = args.many().map((token) => token.value);

	if (!sub) {
		throw new Error(
			i18next.t('command.github.alias.common.errors.no_sub', {
				valid_commands: validSubCommands.join(', '),
				lng: locale,
			}),
		);
	}

	switch (sub) {
		case 'add': {
			const predicate = (s: string) => {
				return !current.some((c) => {
					const [alias] = c.split(':');
					return alias === s;
				});
			};
			const cleaned = cleanAliasCandidates(candidates, predicate);
			return add(message, locale, current, cleaned);
		}

		case 'remove':
		case 'delete': {
			const cleaned = cleanAliasCandidates(candidates, () => true);
			return remove(message, locale, current, cleaned);
		}

		case 'list': {
			return list(message, locale, current);
		}

		case 'default': {
			throw new Error(
				i18next.t('command.github.alias.common.errors.invalid_sub', {
					command: sub,
					valid_commands: validSubCommands.join(', '),
					lng: locale,
				}),
			);
		}
	}
}
