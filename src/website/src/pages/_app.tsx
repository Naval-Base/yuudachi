import { AppProps } from 'next/app';
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import '~/styles/main.scss';

import { ZustandProvider } from '~/components/ZustandProvider';
import Layout from '~/components/Layout';

import { useHydrateUserStore } from '~/store/index';

const queryCache = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
		},
	},
});

const App = ({ Component, pageProps }: AppProps) => {
	const store = useHydrateUserStore(pageProps.initialStoreState);

	return (
		<>
			<Head>
				<title>Yuudachi Dashboard</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />

				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
				<meta name="msapplication-TileColor" content="#2d89ef" />
				<meta name="theme-color" content="#ffffff" />
			</Head>
			<QueryClientProvider client={queryCache}>
				<ZustandProvider store={store}>
					<ChakraProvider>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</ChakraProvider>
				</ZustandProvider>
			</QueryClientProvider>
		</>
	);
};

export default App;
