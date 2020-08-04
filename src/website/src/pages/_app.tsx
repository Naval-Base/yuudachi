import { AppProps } from 'next/app';
import { ThemeProvider, CSSReset, ColorModeProvider, theme, DarkMode } from '@chakra-ui/core';
import '../styles/main.scss';

const App = ({ Component, pageProps }: AppProps) => (
	<ThemeProvider theme={theme}>
		<CSSReset />
		<ColorModeProvider>
			<DarkMode>
				<Component {...pageProps} />
			</DarkMode>
		</ColorModeProvider>
	</ThemeProvider>
);

export default App;
