import { injectable, inject } from 'tsyringe';
import { Message } from '@spectacles/types';
import { Args } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';

import Command from '../../Command';
import { kSQL } from '../../tokens';
import { uniqueValidatedValues } from '../../../util';

@injectable()
export default class GitHubAliasCommand implements Command {
	private static readonly validSubCommands = ['`add`', '`remove`', '`list`'];

	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.githubalias.common.execute.no_guild', { lng: locale }));
		}

		// TODO: remove DEBUG:
		if (args.flag('drop', 'd')) {
			await this.sql`
				delete from guild_settings
				where guild_id = ${message.guild_id}
			`;
		}

		const current = await this.fetchAliases(message.guild_id);

		const sub = args.single();
		const candidates = args.many().map((token) => token.value);
		const cleaned = GitHubAliasCommand.cleanAliasCandidates(candidates);

		console.log(cleaned);

		if (!sub) {
			throw new Error(
				i18next.t('command.githubalias.common.no_sub', {
					lng: locale,
					valid_commands: GitHubAliasCommand.validSubCommands.join(', '),
				}),
			);
		}

		switch (sub) {
			case 'add': {
				return this.add(message, locale, current, cleaned);
			}

			case 'remove':
			case 'delete': {
				return this.remove(message, locale, current, cleaned);
			}

			case 'list': {
				return this.list(message, locale, current);
			}

			case 'default': {
				throw new Error(
					i18next.t('command.githubalias.common.invalid_sub', {
						lng: locale,
						command: sub,
						valid_commands: GitHubAliasCommand.validSubCommands.join(', '),
					}),
				);
			}
		}
	}

	private async add(message: Message, locale: string, current: string[], cleaned: string[]) {
		if (!cleaned.length) {
			throw new Error(
				i18next.t('command.githubalias.add.no_args', {
					lng: locale,
					format: this.argsFormat(locale),
				}),
			);
		}

		const updated = uniqueValidatedValues([...current, ...cleaned]);

		if (updated.length === current.length) {
			throw new Error(
				i18next.t('command.githubalias.add.no_add', {
					lng: locale,
				}),
			);
		}

		await this.sql`
					insert into guild_settings(guild_id, repository_aliases)
					values(${message.guild_id!}, ${this.sql.array(updated)})
					on conflict (guild_id)
					do update set repository_aliases = ${this.sql.array(updated)}
				`;

		const added = cleaned.filter((elem) => !current.includes(elem));
		const content = `${i18next.t('command.githubalias.add.title', { lng: locale })}\n${added
			.map((r) => `• \`${r}\``)
			.join('\n')}`;

		void this.rest.post(`/channels/${message.channel_id}/messages`, {
			content,
		});
	}

	private async remove(message: Message, locale: string, current: string[], cleaned: string[]) {
		if (!cleaned.length) {
			throw new Error(
				i18next.t('command.githubalias.remove.no_args', {
					lng: locale,
					format: this.argsFormat(locale),
				}),
			);
		}

		if (!current.length) {
			throw new Error(
				i18next.t('command.githubalias.remove.no_current', {
					lng: locale,
				}),
			);
		}

		const updated = uniqueValidatedValues(current.filter((elem) => !cleaned.includes(elem)));

		if (updated.length === current.length) {
			throw new Error(
				i18next.t('command.githubalias.remove.no_remove', {
					lng: locale,
				}),
			);
		}

		await this.sql`
					update guild_settings
					set repository_aliases = ${this.sql.array(updated)}
					where guild_id = ${message.guild_id!}
				`;

		const removed = current.filter((elem) => !updated.includes(elem));
		const content = `${i18next.t('command.githubalias.remove.title', { lng: locale })}\n${removed
			.map((r) => `\`${r}\``)
			.join(', ')}`;

		void this.rest.post(`/channels/${message.channel_id}/messages`, {
			content,
		});
	}

	private list(message: Message, locale: string, current: string[]) {
		if (!current.length) {
			throw new Error(
				i18next.t('command.githubalias.list.no_current', {
					lng: locale,
				}),
			);
		}

		const content = `${i18next.t('command.githubalias.list.title', { lng: locale })}\n${current
			.map((r) => `• \`${r}\``)
			.join('\n')}`;

		void this.rest.post(`/channels/${message.channel_id}/messages`, {
			content,
		});
	}

	private argsFormat(locale: string) {
		return i18next.t('command.githubalias.common.alias_format', { lng: locale });
	}

	private async fetchAliases(guild: string): Promise<string[]> {
		const [result] = await this.sql<{ repository_aliases: string[] }>`
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

	private static cleanAliasCandidates(inputs: string[]): string[] {
		return inputs.map((i) => GitHubAliasCommand.resolveAlias(i)).filter((e) => e) as string[];
	}

	private static resolveAlias(input: string): string | undefined {
		const regex = /(.+):(?:https:\/\/github\.com\/|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;
		const match = regex.exec(input.trim());

		if (!match) {
			return undefined;
		}

		const [_, alias, repository] = match;
		return `${alias.toLowerCase()}:${repository.toLowerCase()}`;
	}
}
