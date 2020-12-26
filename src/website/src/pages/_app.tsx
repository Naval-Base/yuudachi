import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';

import '~/styles/main.scss';

import store from '~/store/index';

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
		<QueryClientProvider client={queryCache}>
			<Hydrate state={pageProps.dehydratedState}>
				<Provider store={store}>
					<ChakraProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</ChakraProvider>
				</Provider>
			</Hydrate>
		</QueryClientProvider>
	);
};

export default App;
