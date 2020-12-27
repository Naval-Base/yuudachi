import fetch from 'cross-fetch';
import { configureRefreshFetch, fetchJSON } from 'refresh-fetch';
import Cookies from 'universal-cookie';

class ResponseError extends Error {
	public readonly name = 'ResponseError';

	public constructor(public status: number, public response: Response, public body: any) {
		super();
	}
}

const fetchWithToken = (input: string | Request | URL, options: Record<string, any> = { headers: {} }) => {
	const cookies = new Cookies();
	const token = cookies.get<string>('access_token');

	if (token) {
		options.headers = { ...options.headers, authorization: `Bearer ${token}` };
	}

	// eslint-disable-next-line no-undef
	return fetch(input as RequestInfo, {
		...options,
		headers: { 'Content-Type': 'application/json', ...options.headers },
	})
		.then((response) =>
			response
				.clone()
				.json()
				.then((body) => ({ response, body })),
		)
		.then(({ response, body }) => {
			if (response.ok) {
				if (body.errors?.[0].extensions.code === 'invalid-jwt') {
					throw new ResponseError(response.status, response, body);
				}
				return { response, body };
			}
			throw new ResponseError(response.status, response, body);
		});
};

const shouldRefresh = (error: { response: Response; body: any }) =>
	error.response.status === 401 || error.body.errors[0].extensions.code === 'invalid-jwt';

const refreshToken = () => {
	return fetchJSON('http://localhost:3600/api/auth/refresh', { credentials: 'include' });
};

const refreshFetch = configureRefreshFetch({
	fetch: fetchWithToken,
	shouldRefreshToken: shouldRefresh,
	refreshToken,
});

export default refreshFetch;
