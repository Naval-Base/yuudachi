export default function(): any {
	return {
		httpEndpoint: 'http://localhost:5000/graphql',
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
