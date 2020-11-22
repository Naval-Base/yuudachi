import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Hydrate } from 'react-query/hydration';

import '../styles/main.scss';

import store from '../store';
import Layout from '../components/Layout';

const queryCache = new QueryCache({
	defaultConfig: {
		queries: {
			staleTime: Infinity,
		},
	},
});

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<ReactQueryCacheProvider queryCache={queryCache}>
			<Hydrate state={pageProps.dehydratedState}>
				<Provider store={store}>
					<ChakraProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</ChakraProvider>
				</Provider>
			</Hydrate>
			<ReactQueryDevtools initialIsOpen={false} />
		</ReactQueryCacheProvider>
	);
};

export default App;
