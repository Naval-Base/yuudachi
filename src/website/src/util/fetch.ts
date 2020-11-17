import { configureRefreshFetch, fetchJSON } from 'refresh-fetch';

const shouldRefresh = (error: { response: Response }) => error.response.status === 401;

const refreshToken = () => {
	return fetchJSON('http://localhost:3500/api/auth/refresh', { credentials: 'include' });
};

const fetch = configureRefreshFetch({
	fetch: fetchJSON,
	shouldRefreshToken: shouldRefresh,
	refreshToken,
});

export { fetch };
