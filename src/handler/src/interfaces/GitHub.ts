export interface GithubAuthor {
	avatarUrl: string;
	login: string;
	url: string;
}

export interface GithubUser {
	login: string;
}

export interface GithubLabel {
	name: string;
	color: string;
	url: string;
}

export interface GithubCommit {
	abbreviatedOid: string;
}

export interface GithubReview {
	author: GithubUser;
	state: GithubReviewState;
	url: string;
	authorAssociation: GithubAuthorAssociation;
	createdAt: string;
}

export enum GithubReviewState {
	PENDING = 'PENDING',
	COMMENTED = 'COMMENTED',
	APPROVED = 'APPROVED',
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	DISMISSED = 'DISMISSED',
}

export enum GithubAuthorAssociation {
	MEMBER = 'MEMBER',
	OWNER = 'OWNER',
	COLLABORATOR = 'COLLABORATOR',
	CONTRIBUTOR = 'CONTRIBUTOR',
	FIRST_TIME_CONTRIBUTOR = 'FIRST_TIME_CONTRIBUTOR',
	FIRST_TIMER = 'FIRST_TIMER',
	NONE = 'NONE',
}

export interface GithubIssue {
	author: GithubAuthor;
	body: string;
	number: number;
	publishedAt: string;
	title: string;
	url: string;
	closed: boolean;
	closedAt: string | null;
	labels: { nodes: GithubLabel[] };
	comments: { totalCount: number };
}

export enum GithubReviewDecision {
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	APPROVED = 'APPROVED',
	REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export interface GithubPrData {
	commits: { nodes: GithubCommit[] };
	merged: boolean;
	mergeCommit: GithubCommit | null;
	headRef: { name: string } | null;
	headRepository: { nameWithOwner: string };
	mergedAt: string | null;
	mergedBy: GithubUser | null;
	isDraft: boolean;
	reviewDecision: GithubReviewDecision | null;
	reviews: { nodes: GithubReview[] };
}

export type GithubPr = GithubIssue & GithubPrData;

export interface GitHubApiData {
	repository: {
		name: string;
		issueOrPullRequest: GithubIssue | GithubPr;
	};
}

export function isPR(issue: GithubIssue | GithubPr): issue is GithubPr {
	return Reflect.has(issue, 'commits');
}
