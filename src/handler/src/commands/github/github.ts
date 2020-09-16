import { injectable, inject } from 'tsyringe';
import { Message } from '@spectacles/types';
import { Args } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';

import Command from '../../Command';
import { kSQL } from '../../tokens';

const VALID_SUB_COMMANDS = ['repository'] as const;
const VALID_SUB_COMMANDS_REPOSITORY = ['add', 'remove', 'list'] as const;

@injectable()
export class GitHubSettingsCommand implements Command {
	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.github.common.execute.no_guild', { lng: locale }));
		}

		const sub = args.single();

		if (!sub) {
			throw new Error(
				i18next.t('command.github.common.no_sub', {
					lng: locale,
					valid_commands: VALID_SUB_COMMANDS.join(', '),
				}),
			);
		}
		switch (sub) {
			case 'repository':
			case 'repo': {
				return this.repository(message, args, locale);
			}
			default: {
				throw new Error(
					i18next.t('command.github.common.invalid_sub', {
						lng: locale,
						command: sub,
						valid_commands: VALID_SUB_COMMANDS.join(', '),
					}),
				);
			}
		}
	}

	private async repository(message: Message, args: Args, locale: string) {
		const sub = args.single();
		const candidates = args.many().map((token) => token.value);

		if (!sub) {
			throw new Error(
				i18next.t('command.github.repository.no_sub', {
					lng: locale,
					valid_commands: VALID_SUB_COMMANDS.join(', '),
				}),
			);
		}

		if (['add', 'remove', 'delete'].includes(sub) && !candidates.length) {
			throw new Error(
				i18next.t('command.github.repository.no_sub', {
					lng: locale,
					valid_commands: VALID_SUB_COMMANDS.join(', '),
				}),
			);
		}

		switch (sub) {
			case 'add': {
				const cleaned = GitHubSettingsCommand.cleanCandidates(candidates).map((s) => s.toLowerCase());
				if (!cleaned.length) {
					throw new Error(
						i18next.t('command.github.repository.add.no_args', {
							lng: locale,
						}),
					);
				}

				const repositories = await this.fetchRepositories(message.guild_id!);
				const updated = [...repositories, ...cleaned];

				if (updated.length === repositories.length) {
					throw new Error(
						i18next.t('command.github.repository.add.no_new', {
							lng: locale,
						}),
					);
				}

				await this.sql<{ repositories: string }>`
					update guild_settings
					set repositories = ${updated.join(',')}
					where guild_id = ${message.guild_id!}
				`;

				const added = cleaned.filter((r) => !repositories.includes(r));
				const content = `${i18next.t('command.github.repository.add.title', { lng: locale })}\n${added
					.map((r) => `• \`${r}\``)
					.join('\n')}`;

				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content,
				});
			}

			case 'remove':
			case 'delete': {
				const cleaned = GitHubSettingsCommand.cleanCandidates(candidates).map((s) => s.toLowerCase());
				if (!cleaned.length) {
					throw new Error(
						i18next.t('command.github.repository.remove.no_args', {
							lng: locale,
						}),
					);
				}

				const repositories = await this.fetchRepositories(message.guild_id!);
				const updated = repositories.filter((r) => !cleaned.includes(r));

				if (updated.length === repositories.length) {
					throw new Error(
						i18next.t('command.github.repository.remove.removed_none', {
							lng: locale,
						}),
					);
				}

				await this.sql<{ repositories: string }>`
					update guild_settings
					set repositories = ${updated.join(',')}
					where guild_id = ${message.guild_id!}
				`;

				const removed = repositories.filter((r) => !updated.includes(r));
				const content = `${i18next.t('command.github.repository.remove.title', { lng: locale })}\n${removed
					.map((r) => `• \`${r}\``)
					.join('\n')}`;

				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content,
				});
			}

			case 'list': {
				const repositories = await this.fetchRepositories(message.guild_id!);
				const content = repositories.length
					? `${i18next.t('command.github.repository.list.title', { lng: locale })}\n${repositories
							.map((r) => `• \`${r}\``)
							.join('\n')}`
					: i18next.t('command.github.repositories.list.none', { lng: locale });
				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content,
				});
			}
			default: {
				throw new Error(
					i18next.t('command.github.common.invalid_sub', {
						lng: locale,
						command: sub,
						valid_commands: VALID_SUB_COMMANDS_REPOSITORY.join(', '),
					}),
				);
			}
		}
	}

	private async fetchRepositories(guild: string): Promise<string[]> {
		const [result] = await this.sql<{ repositories: string }>`
			select repositories
			from guild_settings
			where guild_id = ${guild}
		`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!result || !result.repositories.length) {
			return [];
		}

		return result.repositories.split(',');
	}

	private static cleanCandidates(urls: string[]): string[] {
		return urls.map((u) => GitHubSettingsCommand.resolveIdentifier(u)).filter((u) => u) as string[];
	}

	private static resolveIdentifier(url: string): string | undefined {
		const regex = /(https?: \/\/github\.com|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-][^\.]+)(\.git)?/;
		const match = regex.exec(url);
		return match?.[1];
	}
}
