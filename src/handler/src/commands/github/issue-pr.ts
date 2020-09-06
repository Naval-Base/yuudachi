import { Args, joinTokens } from 'lexure';
import { injectable, inject } from 'tsyringe';
import { Message, Embed, EmbedField } from '@spectacles/types';
import { Sql } from 'postgres';
import fetch from 'node-fetch';
// import i18next from 'i18next'; TODO: i18n
import Rest from '@yuudachi/rest';

import Command from '../../Command';
import { kSQL } from '../../tokens';
import { GitHubAPIData, isPR, GitHubReview, GitHubReviewDecision, GitHubReviewState } from '../../interfaces/GitHub';

const BASE_URL = 'https://api.github.com/graphql';

interface StringStringMapping {
	[index: string]: string | undefined;
}

interface StringReviewMapping {
	[index: string]: GitHubReview | undefined;
}

const RepositoryAliases: StringStringMapping = {
	g: 'discord.js',
	c: 'collection',
	dapi: 'discord-api-docs',
	next: 'discord.js-next',
};

const LabelColors: StringStringMapping = {
	'0075ca': '<:0075ca:751210299394359316>',
	'027b69': '<:027b69:751210290846367825>',
	'1d637f': '<:1d637f:751210249721217155>',
	'276bd1': '<:276bd1:751210308500062310>',
	'4b1f8e': '<:4b1f8e:751210257811767297>',
	'7057ff': '<:7057ff:751210318385905724>',
	'7ef7ef': '<:7ef7ef:751210266217414768>',
	aed5fc: '<:aed5fc:751210330020905003>',
	b6b1f9: '<:b6b1f9:751210340577968199>',
	c10f47: '<:c10f47:751210349918683249>',
	c66037: '<:c66037:751210359477764126>',
	cfd3d7: '<:cfd3d7:751210367430033489>',
	d73a4a: '<:d73a4a:751210378981015565>',
	d876e3: '<:d876e3:751210389143814274>',
	default: '<:default:751211609430425611>',
	e4e669: '<:e4e669:751210418999001128>',
	e4f486: '<:e4f486:751210427777679362>',
	e8be8b: '<:e8be8b:751210441707094036>',
	ea8785: '<:ea8785:751210466033795274>',
	f06dff: '<:f06dff:751210476523749487>',
	fbca04: '<:fbca04:751210487508762675>',
	fc1423: '<:fc1423:751210498950955048>',
	fcf95a: '<:fcf95a:751210515203620928>',
	ffccd7: '<:ffccd7:751210528021544991>',
	ffffff: '<:ffffff:751210537597272076>',
};

enum ResultStatePr {
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
	DRAFT = 'Draft',
}

enum StateColors {
	OPEN = 4827469,
	CLOSED = 12267569,
	MERGED = 6441376,
	DRAFT = 12961221,
}

const Timestamps = {
	OPEN: 'publishedAt',
	CLOSED: 'closedAt',
	MERGED: 'mergedAt',
	DRAFT: 'publishedAt',
} as const;

type TimestampsWithoutMerged = Omit<typeof Timestamps, 'MERGED'>;

type TimestampsWithoutMergedKey = TimestampsWithoutMerged[keyof TimestampsWithoutMerged];

enum TickStates {
	TICK = '<:tick:747502128003809332>',
	NO_TICK = '<:notick:751200038323093521>',
}

enum AllowedRepositories {
	'action-docs',
	'action-eslint',
	'action-webpack',
	'collection',
	'commando',
	'discord-api-docs',
	'discord-api-types',
	'discord.js-next',
	'discord.js',
	'erlpack',
	'form-data',
	'guide',
	'node-pre-gyp',
	'opus',
	'rpc',
	'webhook-filter',
	'website',
}

enum PrIcons {
	OPEN = 'https://cdn.discordapp.com/emojis/751210109333405727.png',
	CLOSED = 'https://cdn.discordapp.com/emojis/751210080459817092.png',
	MERGED = 'https://cdn.discordapp.com/emojis/751210169609748481.png',
	DRAFT = 'https://cdn.discordapp.com/emojis/751210097463525377.png',
}

enum IssueIcons {
	OPEN = 'https://cdn.discordapp.com/emojis/751210140086042686.png?v=1',
	CLOSED = 'https://cdn.discordapp.com/emojis/751210129977901100.png',
}

enum Badges {
	DJS = '<:DiscordJS:751202824804630539>',
}

@injectable()
export default class implements Command {
	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string) {
		const githubToken = process.env.GITHUB_TOKEN;
		if (!githubToken) throw new Error('no github token'); // TODO: user friendly output (only if not regex cmd, when regex cmd implementation is considered)

		const rest = joinTokens(args.many());
		const regex = /(?<repo>\S+)#(?<num>\d+) ?(?<verbose>(--verbose|-verbose|--v|-v))?/i;

		const groups = regex.exec(rest)?.groups;

		if (!groups) {
			return;
		}

		const verbose = args.flag('v', 'verbose');

		const matchRepo = groups.repo.toLowerCase();
		const matchIssue = groups.num;

		const repository = RepositoryAliases[matchRepo] ?? matchRepo;
		const owner = repository === 'discord-api-docs' ? 'discord' : 'discordjs';

		if (!(repository.toLowerCase() in AllowedRepositories)) {
			return;
		}

		try {
			const query = this.buildQuery(owner, repository, matchIssue);
			const res = await fetch(BASE_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.GITHUB_TOKEN!}`,
				},
				body: JSON.stringify({ query }),
			}).then((res) => res.json());

			if (!res?.data?.repository?.issueOrPullRequest) {
				return;
			}

			const data = res.data as GitHubAPIData;
			const issue = data.repository.issueOrPullRequest;
			const resultState = isPR(issue)
				? issue.merged
					? ResultStatePr.MERGED
					: issue.isDraft
					? ResultStatePr.DRAFT
					: issue.closed
					? ResultStatePr.CLOSED
					: ResultStatePr.OPEN
				: issue.closed
				? ResultStateIssue.CLOSED
				: ResultStateIssue.OPEN;

			// resolve image
			const imageRegex = /!\[(?<alt>.*)\]\((?<url>.*?(\.png|\.gif|\.jpg))\)/i;
			const groups = imageRegex.exec(issue.body)?.groups;

			// footer icon
			const icon_url = isPR(issue)
				? PrIcons[resultState as ResultStatePr]
				: IssueIcons[resultState as ResultStateIssue];

			// footer text
			const comments = issue.comments.totalCount ? `(${this.formatCommentString(issue.comments.totalCount)})` : '';
			const action =
				resultState === 'MERGED'
					? ' merged'
					: resultState === 'CLOSED'
					? ' closed'
					: resultState === 'DRAFT'
					? ' draft opened'
					: ' opened';
			const mergedBy =
				isPR(issue) && resultState === 'MERGED' && issue.mergedBy?.login ? ` by ${issue.mergedBy.login}` : '';
			const mergedIn =
				isPR(issue) && resultState === 'MERGED' && issue.mergeCommit?.abbreviatedOid
					? ` in ${issue.mergeCommit.abbreviatedOid}`
					: '';

			const text = `${comments}${action}${mergedBy}${mergedIn}`;

			// timestamp
			const timestampProperty = Timestamps[resultState];

			const e1: Embed = {
				author: {
					icon_url: `${issue.author.avatarUrl}?anticache=${Date.now()}`,
					name: issue.author.login,
					url: issue.author.url,
				},
				title: `#${issue.number} ${issue.title}`,
				url: issue.url,
				footer: { text, icon_url },
				description: verbose ? this.formatBody(issue.body) : undefined,
				color: StateColors[resultState],
				image: verbose && groups ? { url: groups.url } : undefined,
				timestamp: isPR(issue) ? issue[timestampProperty]! : issue[timestampProperty as TimestampsWithoutMergedKey]!,
			};

			// install with
			const installable = resultState in InstallableState;
			const e2: Embed =
				isPR(issue) && installable
					? this.addField(e1, {
							name: 'Install with',
							value: `\`npm i ${issue.headRepository.nameWithOwner}#${issue.headRef?.name ?? 'unknown'}\``,
					  })
					: e1;

			// reviews
			const reviews = isPR(issue) ? this.relevantReviews(issue.author.login, issue.reviews.nodes) : [];
			const reviewBody = reviews
				.map((r) => {
					const isDjsMember =
						owner === 'discordjs' && ['MEMBER', 'OWNER', 'COLLABORATOR'].includes(r.authorAssociation);
					const reviewBadge = isDjsMember ? Badges.DJS : '';
					const reviewLink = `[${r.author.login}](${r.url})`;
					const reviewState = `${this.cleanDecision(r.state)}`;
					return `${reviewBadge} ${reviewLink} ${reviewState}`;
				})
				.join('\n');

			const reviewTitle = `Reviews${
				isPR(issue) && issue.reviewDecision ? ` (state: ${this.cleanDecision(issue.reviewDecision)})` : ''
			}`;

			const e3: Embed = reviews.length ? this.addField(e2, { name: reviewTitle, value: reviewBody }) : e2;

			// labels
			const e4: Embed = issue.labels.nodes.length
				? this.addField(e3, {
						name: 'Labels',
						value: issue.labels.nodes
							.map((l: { name: string; color: string; url: string }) => `${this.label(l.color)}[${l.name}](${l.url})`)
							.join(' '),
				  })
				: e3;

			this.rest.post(`/channels/${message.channel_id}/messages`, {
				embed: e4,
			});
		} catch {}
	}

	private buildQuery(owner: string, repository: string, issueID: string) {
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
						labels(first: 10) {
							nodes {
								name
								color
								url
							}
						}
						comments {
							totalCount
						}
						reviewDecision
						reviews(first: 99) {
							nodes {
								author {
									login
								},
								state
								url
								authorAssociation
								createdAt
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
						labels(first: 10) {
							nodes {
								name
								color
								url
							}
						}
						comments {
							totalCount
						}
					}
				}
			}
		}`;
	}

	private relevantReviews(author: string, reviews?: GitHubReview[]): GitHubReview[] {
		if (!reviews) {
			return [];
		}

		const reviewMap = reviews.reduce((acc, current) => {
			const login = current.author.login;
			if (login === author) {
				return acc;
			}
			const prev = acc[login];
			if (prev) {
				const currDate = new Date(current.createdAt);
				const prevDate = new Date(prev.createdAt);
				if (currDate.getTime() > prevDate.getTime()) {
					acc[login] = current;
				}
			}
			acc[login] = current;
			return acc;
		}, {} as StringReviewMapping);
		const values = Object.values(reviewMap).filter((r) => r) as GitHubReview[];
		return values.sort((a, b) => {
			const aDate = new Date(a.createdAt);
			const bDate = new Date(b.createdAt);
			return aDate.getTime() - bDate.getTime();
		});
	}

	private formatBody(body: string): string {
		const commentRegex = /<!--[\s\S]*?-->/gi;
		const boxRegex = /- \[x\]/gi;
		const emptyBoxRegex = /- \[ \]/gi;
		const multiLinebreakRegex = /\n(?:\s*\n)+/gim;

		return body
			.replace(commentRegex, '')
			.replace(multiLinebreakRegex, '\n\n')
			.replace(boxRegex, TickStates.TICK)
			.replace(emptyBoxRegex, TickStates.NO_TICK);
	}

	private label(color: string): string {
		return LabelColors[color] ?? LabelColors.default!;
	}

	private cleanDecision(decision: GitHubReviewDecision | GitHubReviewState): string {
		return decision.toLowerCase().replace(/_/g, ' ');
	}

	private formatCommentString(num: number): string {
		return `${num} comment${num > 1 ? 's' : ''}`;
	}

	private addField(embed: Embed, data: EmbedField): Embed {
		return {
			...embed,
			fields: [...(embed.fields ?? []), data],
		};
	}
}
