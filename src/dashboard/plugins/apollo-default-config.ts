export default function(): any {
	return {
		tokenName: 'token',
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
