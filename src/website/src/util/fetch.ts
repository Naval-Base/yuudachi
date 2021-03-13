import fetch from 'cross-fetch';
import Cookies from 'universal-cookie';

import { useUserStore } from '~/store/user';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

class ResponseError extends Error {
	public readonly name = 'ResponseError';

	public constructor(public status: number, public response: Awaited<ReturnType<typeof fetch>>, public body: any) {
		super();
	}
}

export default async function refreshFetch(
	input: string | Request | URL,
	options: Record<string, any> = { headers: {} },
	attempt = 0,
	cookie?: string,
): Promise<{ response: Awaited<ReturnType<typeof fetch>>; body: any }> {
	const cookies = new Cookies(cookie);
	const token = cookies.get<string>('access_token');

	if (token) {
		options.headers = { ...options.headers, authorization: `Bearer ${token}` };
	}

	try {
		if (attempt) {
			await delay(2 ** attempt * 1000);
		}
		const response = await fetch(input as RequestInfo, { ...options, credentials: 'include' });
		const body = await response.clone().json();
		if (response.ok) {
			if (body.errors?.[0].extensions.code === 'invalid-jwt') {
				throw new ResponseError(response.status, response, body);
			}
			return { response, body };
		}

		throw new ResponseError(response.status, response, body);
	} catch (error) {
		if (error.body.errors[0].extensions.code === 'invalid-jwt') {
			if (/JWTExpired/.test(error.body.errors[0].message)) {
				try {
					let refreshHeaders = {};
					if (cookie) {
						refreshHeaders = { cookie };
					}
					const res = await fetch('http://localhost:3600/api/auth/refresh', {
						headers: { ...refreshHeaders },
						credentials: 'include',
					});
					if (!res.ok || res.status === 401) {
						throw new ResponseError(res.status, res, {});
					}
					return refreshFetch(input, options, attempt++, cookie);
				} catch (e) {
					useUserStore.getState().logout();
					cookies.remove('access_token');
					throw e;
				}
			} else if (/JWTIssuedAtFuture/.test(error.body.errors[0].message)) {
				return refreshFetch(input, options, 0, cookie);
			}
		}

		cookies.remove('access_token');
		throw error;
	}
}
