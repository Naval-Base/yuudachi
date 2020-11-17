import { AppProps } from 'next/app';
import { ChakraProvider, theme, DarkMode } from '@chakra-ui/react';
import { Provider } from 'react-redux';

import '../styles/main.scss';
import store from '../store';
import Layout from '../components/Layout';

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<Provider store={store}>
			<ChakraProvider theme={theme}>
				<DarkMode>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</DarkMode>
			</ChakraProvider>
		</Provider>
	);
};

export default App;
