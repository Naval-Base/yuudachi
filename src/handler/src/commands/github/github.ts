import { Args } from 'lexure';
import { injectable, inject } from 'tsyringe';
import { Message } from '@spectacles/types';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';

import Command, { ExecutionContext } from '../../Command';
import { kSQL } from '../../tokens';

import { alias } from './sub/alias';
import { issuePR } from './sub/issue-pr';
import { commit } from './sub/commit';

interface RepositoryEntry {
	owner: string;
	repository: string;
}

export class GitHubAPIError extends Error {}

@injectable()
export default class GitHub implements Command {
	public readonly regExp = /(?:([A-Za-z0-9_.-]+)\/)?([A-Za-z0-9_.-]+)#([A-Za-z0-9_.-]+)/;
	public readonly aliases = ['gh'];

	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string, executionContext: ExecutionContext) {
		const isPrefixed = executionContext === ExecutionContext['PREFIXED'];

		if (!message.guild_id) return;

		const githubToken = process.env.GITHUB_TOKEN;

		if (!githubToken) {
			if (!isPrefixed) return;
			throw new Error(i18next.t('command.github.execute.no_token', { lng: locale }));
		}

		const first = args.single();

		if (first === 'alias' && isPrefixed) {
			return alias(message, args, locale, this.sql, this.rest);
		}

		const second = args.single();
		const third = args.single();

		if (!first) {
			if (!isPrefixed) return;
			throw new Error(i18next.t('command.github.execute.args_missing', { lng: locale }));
		}

		const repositoryAliases = await this.fetchAliases(message.guild_id);
		const aliasEntry = repositoryAliases.get(first);

		const owner = third ? first : aliasEntry?.owner;
		const repository = third ? second : aliasEntry?.repository;
		const issueOrExpression = third ? third : second;

		if (!owner || !repository || !issueOrExpression) {
			if (!isPrefixed) return;
			throw new Error(i18next.t('command.github.execute.args_missing', { lng: locale }));
		}

		if (!GitHub.validateGitHubName(owner)) {
			if (!isPrefixed) return;
			throw new Error(i18next.t('command.github.execute.invalid_owner', { lng: locale }));
		}

		if (!GitHub.validateGitHubName(repository)) {
			if (!isPrefixed) return;
			throw new Error(i18next.t('command.github.execute.invalid_repository', { lng: locale }));
		}

		const parsed = Number(issueOrExpression);
		if (isNaN(parsed)) {
			return commit(owner, repository, issueOrExpression, locale, isPrefixed, this.rest, message);
		}

		return issuePR(owner, repository, parsed, locale, isPrefixed, this.rest, message);
	}

	private static validateGitHubName(name: string): boolean {
		const reg = /[A-Za-z0-9_.-]+/;
		const match = reg.exec(name);
		return name.length === match?.[0].length;
	}

	private async fetchAliases(guild: string): Promise<Map<string, RepositoryEntry>> {
		const [result] = await this.sql<{ repository_aliases: string[] }>`
			select repository_aliases
			from guild_settings
			where guild_id = ${guild}
		`;

		const mapping: Map<string, RepositoryEntry> = new Map();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!result?.repository_aliases?.length) {
			return mapping;
		}

		for (const r of result.repository_aliases) {
			const [alias, rest] = r.split(':');
			const [owner, repository] = rest.split('/');
			mapping.set(alias, { owner, repository });
		}

		return mapping;
	}
}
