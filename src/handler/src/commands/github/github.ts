import { injectable, inject } from 'tsyringe';
import { Message } from '@spectacles/types';
import { Args } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';

import Command from '../../Command';
import { kSQL } from '../../tokens';
import { uniqueValidatedValues } from '../../../util';

const VALID_SUB_COMMANDS = ['repository', 'alias', 'label'] as const;

enum SubCommand {
	REPOSITORY,
	ALIAS,
	LABEL,
}

@injectable()
export default class GitHubSettingsCommand implements Command {
	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.github.common.execute.no_guild', { lng: locale }));
		}

		// TODO: remove DEBUG:
		if (args.flag('drop', 'd')) {
			await this.sql`
				delete from guild_settings
				where guild_id = ${message.guild_id}
			`;
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
			case 'repositories':
			case 'repo': {
				const current = await this.fetchRepositories(message.guild_id);
				return this.subCommand(
					message,
					args,
					locale,
					current,
					GitHubSettingsCommand.cleanRepositoryCandidates,
					'repositories',
					SubCommand['REPOSITORY'],
				);
			}
			case 'alias': {
				const current = await this.fetchAliases(message.guild_id);
				return this.subCommand(
					message,
					args,
					locale,
					current,
					GitHubSettingsCommand.cleanAliasCandidates,
					'repository_aliases',
					SubCommand['ALIAS'],
				);
			}
			case 'label':
			case 'labels': {
				const current = await this.fetchLabels(message.guild_id);
				return this.subCommand(
					message,
					args,
					locale,
					current,
					GitHubSettingsCommand.cleanLabelCandidates,
					'repository_labels',
					SubCommand['LABEL'],
				);
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

	private async subCommand(
		message: Message,
		args: Args,
		locale: string,
		current: string[],
		validator: (input: string[]) => string[],
		settingsProperty: string,
		parentSub: SubCommand,
	) {
		const sub = args.single();
		const candidates = args.many().map((token) => token.value);
		const cleaned = validator(candidates);
		const validSubCommands = ['`add`', '`remove`', '`list`'];

		const target =
			parentSub === SubCommand['REPOSITORY']
				? i18next.t('command.github.common.target.repositories', { lng: locale })
				: parentSub === SubCommand['ALIAS']
				? i18next.t('command.github.common.target.aliases', { lng: locale })
				: i18next.t('command.github.common.target.labels', { lng: locale });

		const format =
			parentSub === SubCommand['REPOSITORY']
				? i18next.t('command.github.common.target_format.repository', { lng: locale })
				: parentSub === SubCommand['ALIAS']
				? i18next.t('command.github.common.target_format.alias', { lng: locale })
				: i18next.t('command.github.common.target_format.label', { lng: locale });

		if (!sub) {
			throw new Error(
				i18next.t('command.github.common.no_sub', {
					lng: locale,
					valid_commands: validSubCommands.join(', '),
				}),
			);
		}

		switch (sub) {
			case 'add': {
				if (!cleaned.length) {
					throw new Error(
						i18next.t('command.github.add.no_args', {
							lng: locale,
							target,
							format,
						}),
					);
				}

				const updated = uniqueValidatedValues([...current, ...cleaned]);

				if (updated.length === current.length) {
					throw new Error(
						i18next.t('command.github.add.no_add', {
							lng: locale,
							target,
						}),
					);
				}

				await this.sql`
					insert into guild_settings(guild_id, "${this.sql(settingsProperty)}")
					values(${message.guild_id!}, ${this.sql.array(updated)})
					on conflict (guild_id)
					do update set "${this.sql(settingsProperty)}" = ${this.sql.array(updated)}
				`;

				const added = cleaned.filter((elem) => !current.includes(elem));
				const content = `${i18next.t('command.github.add.title', { lng: locale, target })}\n${added
					.map((r) => `• \`${r}\``)
					.join('\n')}`;

				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content,
				});

				break;
			}

			case 'remove':
			case 'delete': {
				if (!cleaned.length) {
					throw new Error(
						i18next.t('command.github.remove.no_args', {
							lng: locale,
							target,
							format,
						}),
					);
				}

				if (!current.length) {
					throw new Error(
						i18next.t('command.github.remove.no_current', {
							lng: locale,
							target,
						}),
					);
				}

				const updated = uniqueValidatedValues(current.filter((elem) => !cleaned.includes(elem)));

				if (updated.length === current.length) {
					throw new Error(
						i18next.t('command.github.remove.no_remove', {
							lng: locale,
							target,
						}),
					);
				}

				await this.sql`
					update guild_settings
					set ${this.sql(settingsProperty)} = ${this.sql.array(updated)}
					where guild_id = ${message.guild_id!}
				`;

				const removed = current.filter((elem) => !updated.includes(elem));
				const content = `${i18next.t('command.github.remove.title', { lng: locale, target })}\n${removed
					.map((r) => `• \`${r}\``)
					.join('\n')}`;

				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content,
				});

				break;
			}

			case 'list': {
				if (!current.length) {
					throw new Error(
						i18next.t('command.github.list.no_current', {
							lng: locale,
							target,
						}),
					);
				}

				const content = `${i18next.t('command.github.list.title', { lng: locale, target })}\n${current
					.map((r) => `• \`${r}\``)
					.join('\n')}`;

				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content,
				});

				break;
			}

			case 'default': {
				throw new Error(
					i18next.t('command.github.common.invalid_sub', {
						lng: locale,
						command: sub,
						valid_commands: validSubCommands.join(', '),
					}),
				);
			}
		}
	}

	private async fetchRepositories(guild: string): Promise<string[]> {
		const [result] = await this.sql<{ repositories: string[] }>`
			select repositories
			from guild_settings
			where guild_id = ${guild}
		`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!result?.repositories?.length) {
			return [];
		}
		return result.repositories;
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

	private async fetchLabels(guild: string): Promise<string[]> {
		const [result] = await this.sql<{ repository_labels: string[] }>`
			select repository_labels
			from guild_settings
			where guild_id = ${guild}
		`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!result?.repository_labels?.length) {
			return [];
		}

		return result.repository_labels;
	}

	private static cleanRepositoryCandidates(urls: string[]): string[] {
		return urls.map((u) => GitHubSettingsCommand.resolveRepositoryIdentifier(u)).filter((u) => u) as string[];
	}

	private static cleanAliasCandidates(inputs: string[]): string[] {
		return inputs.map((i) => GitHubSettingsCommand.resolveAlias(i)).filter((i) => i) as string[];
	}

	private static cleanLabelCandidates(inputs: string[]): string[] {
		console.log('inputs:', inputs);
		const input = inputs.join('');
		const regex = /<:[A-Fa-f0-9]{6}:\d{17,19}>/g;
		const matches = [];

		let match;
		while ((match = regex.exec(input)) !== null) {
			matches.push(match[0]);
		}

		console.log('matches', matches);
		return matches;
	}

	private static resolveRepositoryIdentifier(url: string): string | undefined {
		const regex = /^(?:https:\/\/github\.com\/|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;
		const match = regex.exec(url.trim());
		return match?.[1].toLowerCase();
	}

	private static resolveAlias(input: string): string | undefined {
		const regex = /(.+):(?:https:\/\/github\.com\/|git@github\.com:)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;
		const match = regex.exec(input.trim());

		if (!match) {
			return undefined;
		}

		const [alias, repository] = match;
		return `${alias.toLowerCase()}:${repository.toLowerCase()}`;
	}
}
