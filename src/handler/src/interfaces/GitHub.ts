export interface GitHubAuthor {
	avatarUrl: string;
	login: string;
	url: string;
}

export interface GitHubUser {
	login: string;
}

export interface GitHubLabel {
	name: string;
	color: string;
	url: string;
}

export interface GitHubCommit {
	abbreviatedOid: string;
}

export interface GitHubReview {
	author: GitHubUser;
	state: GitHubReviewState;
	url: string;
	authorAssociation: GitHubAuthorAssociation;
	createdAt: string;
}

export enum GitHubReviewState {
	PENDING = 'PENDING',
	COMMENTED = 'COMMENTED',
	APPROVED = 'APPROVED',
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	DISMISSED = 'DISMISSED',
}

export enum GitHubAuthorAssociation {
	MEMBER = 'MEMBER',
	OWNER = 'OWNER',
	COLLABORATOR = 'COLLABORATOR',
	CONTRIBUTOR = 'CONTRIBUTOR',
	FIRST_TIME_CONTRIBUTOR = 'FIRST_TIME_CONTRIBUTOR',
	FIRST_TIMER = 'FIRST_TIMER',
	NONE = 'NONE',
}

export interface GitHubIssue {
	author: GitHubAuthor;
	body: string;
	number: number;
	publishedAt: string;
	title: string;
	url: string;
	closed: boolean;
	closedAt: string | null;
	labels: { nodes: GitHubLabel[] };
	comments: { totalCount: number };
}

export enum GitHubReviewDecision {
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	APPROVED = 'APPROVED',
	REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export interface GitHubPRData {
	commits: { nodes: GitHubCommit[] };
	merged: boolean;
	mergeCommit: GitHubCommit | null;
	headRef: { name: string } | null;
	headRepository: { nameWithOwner: string };
	mergedAt: string | null;
	mergedBy: GitHubUser | null;
	isDraft: boolean;
	reviewDecision: GitHubReviewDecision | null;
	reviews: { nodes: GitHubReview[] };
}

export type GitHubPR = GitHubIssue & GitHubPRData;

export interface GitHubAPIData {
	repository: {
		name: string;
		issueOrPullRequest: GitHubIssue | GitHubPR;
	};
}

export function isPR(issue: GitHubIssue | GitHubPR): issue is GitHubPR {
	return Reflect.has(issue, 'commits');
}
