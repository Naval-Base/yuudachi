/* eslint-disable */

declare module 'refresh-fetch' {
	export interface Configuration {
		refreshToken: () => Promise<any>;
		shouldRefreshToken: (error: any) => boolean;
		fetch: (input: RequestInfo, init?: RequestInit | undefined) => Promise<any>;
	}

	export function configureRefreshFetch(
		configuration: Configuration,
	): (input: RequestInfo, init?: RequestInit | undefined) => Promise<{ response: Response; body: any }>;
	export function fetchJSON(input: RequestInfo, init?: RequestInit | undefined): Promise<unknown | string | null>;
}
