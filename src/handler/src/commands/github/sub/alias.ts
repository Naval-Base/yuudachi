import { Message } from '@spectacles/types';
import { Args } from 'lexure';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';
import { ellipsis, uniqueValidatedValues } from '../../../../util';
import { MESSAGE_CONTENT_LIMIT } from '../../../../Constants';

const validSubCommands = ['`add`', '`remove`', '`list`'];
const regExp = /([A-Za-z0-9_.-]+):(?:https:\/\/github\.com\/|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;

export async function alias(message: Message, args: Args, locale: string, sql: Sql<any>, rest: Rest) {
	if (!message.guild_id) {
		throw new Error(i18next.t('command.github.alias.common.execute.no_guild', { lng: locale }));
	}

	const current = await fetchAliases(message.guild_id, sql);

	const sub = args.single();
	const candidates = args.many().map((token) => token.value);

	if (!sub) {
		throw new Error(
			i18next.t('command.github.alias.common.no_sub', {
				lng: locale,
				valid_commands: validSubCommands.join(', '),
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
			return add(message, locale, current, cleaned, sql, rest);
		}

		case 'remove':
		case 'delete': {
			const cleaned = cleanAliasCandidates(candidates, () => true);
			return remove(message, locale, current, cleaned, sql, rest);
		}

		case 'list': {
			return list(message, locale, current, rest);
		}

		case 'default': {
			throw new Error(
				i18next.t('command.github.alias.common.invalid_sub', {
					lng: locale,
					command: sub,
					valid_commands: validSubCommands.join(', '),
				}),
			);
		}
	}
}

async function add(message: Message, locale: string, current: string[], cleaned: string[], sql: Sql<any>, rest: Rest) {
	if (!cleaned.length) {
		throw new Error(
			i18next.t('command.github.alias.add.no_args', {
				lng: locale,
				format: argsFormat(locale),
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
		do update set repository_aliases = ${sql.array(updated)}
		`;

	const added = cleaned.filter((elem) => !current.includes(elem));
	const content = `${i18next.t('command.github.alias.add.title', { lng: locale })}\n${added
		.map((r) => `• \`${r}\``)
		.join('\n')}`;

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: ellipsis(content, MESSAGE_CONTENT_LIMIT),
	});
}

async function remove(
	message: Message,
	locale: string,
	current: string[],
	cleaned: string[],
	sql: Sql<any>,
	rest: Rest,
) {
	if (!cleaned.length) {
		throw new Error(
			i18next.t('command.github.alias.remove.no_args', {
				lng: locale,
				format: argsFormat(locale),
			}),
		);
	}

	if (!current.length) {
		throw new Error(
			i18next.t('command.github.alias.remove.no_current', {
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
			where guild_id = ${message.guild_id!}
		`;

	const removed = current.filter((elem) => !updated.includes(elem));
	const content = `${i18next.t('command.github.alias.remove.title', { lng: locale })}\n${removed
		.map((r) => `\`${r}\``)
		.join(', ')}`;

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: ellipsis(content, MESSAGE_CONTENT_LIMIT),
	});
}

function list(message: Message, locale: string, current: string[], rest: Rest) {
	if (!current.length) {
		throw new Error(
			i18next.t('command.github.alias.list.no_current', {
				lng: locale,
			}),
		);
	}

	const content = `${i18next.t('command.github.alias.list.title', { lng: locale })}\n${current
		.map((r) => `• \`${r}\``)
		.join('\n')}`;

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: ellipsis(content, MESSAGE_CONTENT_LIMIT),
	});
}

function argsFormat(locale: string) {
	return i18next.t('command.github.alias.common.alias_format', { lng: locale });
}

async function fetchAliases(guild: string, sql: Sql<any>): Promise<string[]> {
	const [result] = await sql<{ repository_aliases: string[] }>`
			select repository_aliases
			from guild_settings
			where guild_id = ${guild}
		`;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!result?.repository_aliases?.length) {
		return [];
	}

	return result.repository_aliases;
}

function cleanAliasCandidates(inputs: string[], predicate: (current: string) => boolean | undefined): string[] {
	return inputs.map((i) => resolveAlias(i)).filter((e) => e && predicate(e)) as string[];
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
