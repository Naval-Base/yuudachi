import fetch from 'cross-fetch';
import Cookies from 'universal-cookie';

class ResponseError extends Error {
	public readonly name = 'ResponseError';

	public constructor(public status: number, public response: Response, public body: any) {
		super();
	}
}

function refreshFetch() {
	const cookies = new Cookies();
	let token = cookies.get<string>('access_token');

	return async (input: string | Request | URL, options: Record<string, any> = { headers: {} }) => {
		try {
			if (token) {
				options.headers = { ...options.headers, authorization: `Bearer ${token}` };
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
			if (error.response.status === 401 || error.body.errors[0].extensions.code === 'invalid-jwt') {
				try {
					await fetch('http://localhost:3600/api/auth/refresh', { credentials: 'include' });

					token = cookies.get<string>('access_token');
					if (token) {
						options.headers = { ...options.headers, authorization: `Bearer ${token}` };
					}

					const response = await fetch(input as RequestInfo, options);
					const body = await response.clone().json();

					return { response, body };
				} catch (e) {
					throw e;
				}
			}

			throw error;
		}
	};
}

export default refreshFetch();
