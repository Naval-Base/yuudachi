import fetch from 'cross-fetch';
import Cookies from 'universal-cookie';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class ResponseError extends Error {
	public readonly name = 'ResponseError';

	public constructor(public status: number, public response: Response, public body: any) {
		super();
	}
}

export default async function refreshFetch(
	input: string | Request | URL,
	options: Record<string, any> = { headers: {} },
	attempt = 0,
): Promise<{ response: Response; body: any }> {
	const cookies = new Cookies();
	const token = cookies.get<string>('access_token');

	if (token) {
		options.headers = { ...options.headers, authorization: `Bearer ${token}` };
	}

	try {
		if (attempt) {
			await delay(2 ** attempt * 1000);
		}
		const response = await fetch(input as RequestInfo, options);
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
					const res = await fetch('http://localhost:3600/api/auth/refresh', { credentials: 'include' });
					if (!res.ok || res.status === 401) {
						throw new ResponseError(res.status, res, {});
					}
					return refreshFetch(input, options, attempt++);
				} catch (e) {
					cookies.remove('access_token');
					throw e;
				}
			} else if (/JWTIssuedAtFuture/.test(error.body.errors[0].message)) {
				return refreshFetch(input, options);
			}
		}

		cookies.remove('access_token');
		throw error;
	}
}
