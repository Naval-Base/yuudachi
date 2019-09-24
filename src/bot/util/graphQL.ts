import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

export const graphQLClient = new ApolloClient({
	cache: new InMemoryCache(),
	// @ts-ignore
	link: new HttpLink({
		uri: process.env.GRAPHQL_ENDPOINT!,
		headers: {
			'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
		},
		fetch,
	}),
	defaultOptions: {
		query: {
			fetchPolicy: 'no-cache',
		},
		mutate: {
			fetchPolicy: 'no-cache',
		},
	},
});
