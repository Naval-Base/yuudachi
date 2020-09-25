export interface GitHubAuthor {
	avatarUrl: string;
	login: string;
	url: string;
}

export interface GitHubUser {
	login: string;
}

export interface GitHubCommit {
	abbreviatedOid: string;
}

export interface GitHubReview {
	author: GitHubUser;
	state: GitHubReviewState;
	url: string;
}

export enum GitHubReviewState {
	PENDING = 'PENDING',
	COMMENTED = 'COMMENTED',
	APPROVED = 'APPROVED',
	CHANGES_REQUESTED = 'CHANGES_REQUESTED',
	DISMISSED = 'DISMISSED',
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
	latestOpinionatedReviews: { nodes: GitHubReview[] } | null;
}

export type GitHubPR = GitHubIssue & GitHubPRData;

export interface GitHubAPIErrorData {
	type: string;
	path: string[];
	locations: string[];
	message: string;
}

export interface GitHubAPIData {
	repository?: {
		name: string;
		issueOrPullRequest: GitHubIssue | GitHubPR | null;
	};
}

export interface GitHubAPIResult {
	errors?: GitHubAPIErrorData[];
	data?: GitHubAPIData;
}

export function isPR(issue: GitHubIssue | GitHubPR): issue is GitHubPR {
	return Reflect.has(issue, 'commits');
}
