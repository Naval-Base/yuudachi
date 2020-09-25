import { Message, Embed } from '@spectacles/types';
import Rest from '@yuudachi/rest';
import i18next from 'i18next';
import { GitHubAPIResult } from '../../../interfaces/GitHub';
import fetch from 'node-fetch';

import { GITHUB_BASE_URL, GITHUB_COLOR_COMMIT, GITHUB_ICON_COMMIT } from '../../../../Constants';
import { GitHubAPIError } from '../github';
import { expression } from 'joi';
import { truncateEmbed } from '../../../../util';

export async function commit(
	owner: string,
	repository: string,
	expressions: string,
	locale: string,
	isPrefixed: boolean,
	rest: Rest,
	message: Message,
) {
	try {
		const query = buildQuery(owner, repository, expressions);
		const res = (await fetch(GITHUB_BASE_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN!}`,
			},
			body: JSON.stringify({ query }),
		}).then((res) => res.json())) as GitHubAPIResult;

		if (!res.data) {
			throw new Error(i18next.t('command.github.common.errors.fetch'));
		}

		if (res.errors?.some((e) => e.type === 'NOT_FOUND')) {
			if (!isPrefixed) return;
			throw new GitHubAPIError(
				i18next.t('command.github.commit.errors.not_found', { lng: locale, expression, owner, repository }),
			);
		}

		const commit = res.data.repository?.object;

		if (!commit) {
			if (!isPrefixed) return;
			throw new GitHubAPIError(i18next.t('command.github.common.errors.no_result', { lng: locale }));
		}

		const title = commit.messageHeadline
			? `\`${commit.abbreviatedOid}\` ${commit.messageHeadline}`
			: commit.abbreviatedOid;

		const embed: Embed = {
			author: {
				icon_url: commit.author.user?.avatarUrl ?? commit.author.avatarUrl,
				name: commit.author.user?.login ?? commit.author.name,
				url: commit.author.user?.url ?? undefined,
			},
			color: GITHUB_COLOR_COMMIT,
			title,
			url: commit.commitUrl,
			footer: {
				text: i18next.t('command.github.commit.files_count', { lng: locale, count: commit.changedFiles }),
				icon_url: GITHUB_ICON_COMMIT,
			},
			timestamp: commit.pushedDate,
		};

		await rest.post(`/channels/${message.channel_id}/messages`, {
			embed: truncateEmbed(embed),
		});
	} catch (error) {
		if (!isPrefixed) return;

		if (error instanceof GitHubAPIError) {
			throw error;
		}

		throw new Error(i18next.t('command.github.common.errors.fetch', { lng: locale }));
	}
}

function buildQuery(owner: string, repository: string, expression: string) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				object(expression: "${expression}") {
					... on Commit {
						messageHeadline
						abbreviatedOid
						changedFiles
						commitUrl
						pushedDate
						author {
							avatarUrl
							name
							user {
								login
								avatarUrl
								url
							}
						}
					}
				}
			}
		}`;
}
