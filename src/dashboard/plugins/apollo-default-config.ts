export default function() {
	return {
		httpEndpoint: process.env.GRAPHQL_API || 'http://localhost:5000/graphql',
		httpLinkOptions: {
			credentials: 'include'
		},
		apollo: {
			defaultOptions: {
				query: {
					fetchPolicy: 'no-cache'
				}
			}
		}
	};
}
