import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';

import '~/styles/main.scss';

import Layout from '~/components/Layout';

const queryCache = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
		},
	},
});

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<QueryClientProvider client={queryCache}>
				<Hydrate state={pageProps.dehydratedState}>
					<ChakraProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</ChakraProvider>
				</Hydrate>
			</QueryClientProvider>
		</>
	);
};

export default App;
