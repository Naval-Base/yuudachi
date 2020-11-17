import fetch from './fetch';

export function fetchGraphQL(query: string, variables: Record<string, any>, options: Record<string, any> = {}) {
	return fetch('http://localhost:8080/v1/graphql', {
		...options,
		method: 'POST',
		body: JSON.stringify({
			query,
			variables,
		}),
	});
}
