import { Message, Embed } from '@spectacles/types';
import fetch from 'node-fetch';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';
import { addField, truncateEmbed } from '../../../../util';
import { isPR, GitHubReviewDecision, GitHubReviewState, GitHubAPIResult } from '../../../interfaces/GitHub';

import {
	GITHUB_BASE_URL,
	GITHUB_COLOR_CLOSED,
	GITHUB_COLOR_DRAFT,
	GITHUB_COLOR_MERGED,
	GITHUB_COLOR_OPEN,
	GITHUB_ICON_ISSUE_CLOSED,
	GITHUB_ICON_ISSUE_OPEN,
	GITHUB_ICON_PR_CLOSED,
	GITHUB_ICON_PR_DRAFT,
	GITHUB_ICON_PR_MERGED,
	GITHUB_ICON_PR_OPEN,
} from '../../../../Constants';
import { GitHubAPIError } from '../github';

enum ResultStatePR {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	MERGED = 'MERGED',
	DRAFT = 'DRAFT',
}

enum ResultStateIssue {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
}

enum InstallableState {
	OPEN = 'OPEN',
	DRAFT = 'DRAFT',
}

const Timestamps = {
	OPEN: 'publishedAt',
	CLOSED: 'closedAt',
	MERGED: 'mergedAt',
	DRAFT: 'publishedAt',
} as const;

type TimestampsWithoutMerged = Omit<typeof Timestamps, 'MERGED'>;

type TimestampsWithoutMergedKey = TimestampsWithoutMerged[keyof TimestampsWithoutMerged];

export async function issuePR(
	owner: string,
	repository: string,
	num: number,
	locale: string,
	isPrefixed: boolean,
	rest: Rest,
	message: Message,
) {
	try {
		const query = buildQuery(owner, repository, num);
		const res: GitHubAPIResult = await fetch(GITHUB_BASE_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN!}`,
			},
			body: JSON.stringify({ query }),
		}).then((res) => res.json());

		if (!res.data) {
			throw new Error(i18next.t('command.github.common.errors.fetch'));
		}

		if (res.errors?.some((e) => e.type === 'NOT_FOUND')) {
			if (!isPrefixed) return;
			throw new GitHubAPIError(
				i18next.t('command.github.issue-pr.errors.not_found', { lng: locale, issue: num, owner, repository }),
			);
		}

		const issue = res.data.repository?.issueOrPullRequest;

		if (!issue) {
			if (!isPrefixed) return;
			throw new GitHubAPIError(i18next.t('command.github.common.errors.no_result', { lng: locale }));
		}

		const resultState = isPR(issue)
			? issue.merged
				? ResultStatePR.MERGED
				: issue.isDraft
				? ResultStatePR.DRAFT
				: issue.closed
				? ResultStatePR.CLOSED
				: ResultStatePR.OPEN
			: issue.closed
			? ResultStateIssue.CLOSED
			: ResultStateIssue.OPEN;

		// footer icon
		const icon_url = isPR(issue)
			? resultState === ResultStatePR['OPEN']
				? GITHUB_ICON_PR_OPEN
				: resultState === ResultStatePR['CLOSED']
				? GITHUB_ICON_PR_CLOSED
				: resultState === ResultStatePR['MERGED']
				? GITHUB_ICON_PR_MERGED
				: GITHUB_ICON_PR_DRAFT
			: resultState === ResultStateIssue['OPEN']
			? GITHUB_ICON_ISSUE_OPEN
			: GITHUB_ICON_ISSUE_CLOSED;

		// footer text
		const comments = issue.comments.totalCount
			? `(${i18next.t('command.github.issue-pr.comment_count', { lng: locale, count: issue.comments.totalCount })})`
			: '';

		const isMerge = isPR(issue) && resultState === 'MERGED';
		const user = isPR(issue) && resultState === 'MERGED' ? issue.mergedBy?.login : undefined;
		const commit = isPR(issue) && resultState === 'MERGED' ? issue.mergeCommit?.abbreviatedOid : undefined;

		const action = isMerge
			? user && commit
				? i18next.t('command.github.issue-pr.action.merge_by_in', { lng: locale, user, commit })
				: user
				? i18next.t('command.github.issue-pr.action.merge_by', { lng: locale, user })
				: commit
				? i18next.t('command.github.issue-pr.action.merge_in', { lng: locale, commit })
				: i18next.t('command.github.issue-pr.action.merge', { lng: locale })
			: resultState === 'CLOSED'
			? i18next.t('command.github.issue-pr.action.close', { lng: locale })
			: resultState === 'DRAFT'
			? i18next.t('command.github.issue-pr.action.draft', { lng: locale })
			: i18next.t('command.github.issue-pr.action.open', { lng: locale });

		const footerText = `${comments} ${action}`;

		// timestamp
		const timestampProperty = Timestamps[resultState];

		// color
		const color = isPR(issue)
			? resultState === ResultStatePR['OPEN']
				? GITHUB_COLOR_OPEN
				: resultState === ResultStatePR['CLOSED']
				? GITHUB_COLOR_CLOSED
				: resultState === ResultStatePR['MERGED']
				? GITHUB_COLOR_MERGED
				: GITHUB_COLOR_DRAFT
			: resultState === ResultStateIssue['OPEN']
			? GITHUB_COLOR_OPEN
			: GITHUB_COLOR_CLOSED;

		const e1: Embed = {
			author: {
				icon_url: `${issue.author.avatarUrl}?anticache=${Date.now()}`,
				name: issue.author.login,
				url: issue.author.url,
			},
			title: `#${issue.number} ${issue.title}`,
			url: issue.url,
			footer: { text: footerText, icon_url },
			color,
			timestamp: isPR(issue) ? issue[timestampProperty]! : issue[timestampProperty as TimestampsWithoutMergedKey]!,
		};

		// install with
		const installable = Reflect.has(InstallableState, resultState);
		const e2: Embed =
			isPR(issue) && installable
				? addField(e1, {
						name: i18next.t('command.github.issue-pr.heading.install', { lng: locale }),
						value: `\`npm i ${issue.headRepository.nameWithOwner}#${
							issue.headRef?.name ?? i18next.t('command.github.common.unknown', { lng: locale }) ?? ''
						}\``,
				  })
				: e1;

		// reviews
		const reviews = isPR(issue) ? issue.latestOpinionatedReviews?.nodes ?? [] : [];
		const reviewBody = reviews
			.map((r) => {
				const decision = isPR(issue)
					? r.state === GitHubReviewState['CHANGES_REQUESTED']
						? i18next.t('command.github.issue-pr.review_state.changes_requested', { lng: locale })
						: r.state === GitHubReviewState['APPROVED']
						? i18next.t('command.github.issue-pr.review_state.approved', { lng: locale })
						: r.state === GitHubReviewState['COMMENTED']
						? i18next.t('command.github.issue-pr.review_state.commented', { lng: locale })
						: r.state === GitHubReviewState['DISMISSED']
						? i18next.t('command.github.issue-pr.review_state.dismissed', { lng: locale })
						: i18next.t('command.github.issue-pr.review_state.pending', { lng: locale })
					: '';
				return `${r.author.login} [${decision}](${r.url})`;
			})
			.join(', ');

		const reviewTitle = isPR(issue)
			? issue.reviewDecision === GitHubReviewDecision['CHANGES_REQUESTED']
				? i18next.t('command.github.issue-pr.heading.reviews.changes_requested', { lng: locale })
				: issue.reviewDecision === GitHubReviewDecision['APPROVED']
				? i18next.t('command.github.issue-pr.heading.reviews.approved', { lng: locale })
				: i18next.t('command.github.issue-pr.heading.reviews.review_required', { lng: locale })
			: '';

		const e3: Embed = reviews.length ? addField(e2, { name: reviewTitle, value: reviewBody }) : e2;

		await rest.post(`/channels/${message.channel_id}/messages`, {
			embed: truncateEmbed(e3),
		});
	} catch (error) {
		if (!isPrefixed) return;

		if (error instanceof GitHubAPIError) {
			throw error;
		}

		throw new Error(i18next.t('command.github.common.errors.fetch', { lng: locale }));
	}
}

function buildQuery(owner: string, repository: string, issueID: number) {
	return `
		{
			repository(owner: "${owner}", name: "${repository}") {
				name
				issueOrPullRequest(number: ${issueID}) {
					... on PullRequest {
						commits(last: 1) {
							nodes {
								commit {
									abbreviatedOid
								}
							}
						}
						author {
							avatarUrl
							login
							url
						}
						body
						merged
						mergeCommit {
							abbreviatedOid
						}
						headRef {
							name
						}
						headRepository {
							nameWithOwner
						}
						mergedAt
						mergedBy {
							login
						}
						isDraft
						number
						publishedAt
						title
						url
						closed
						closedAt
						comments {
							totalCount
						}
						reviewDecision
						latestOpinionatedReviews(last: 99) {
							nodes {
								author {
									login
								}
								state
								url
							}
						}
					}
					... on Issue {
						author {
							avatarUrl
							login
							url
						}
						body
						number
						publishedAt
						title
						url
						closed
						closedAt
						comments {
							totalCount
						}
					}
				}
			}
		}`;
}
