import type { AppProps } from 'next/app';
import '@unocss/reset/normalize.css';
import '../styles/main.css';

export default function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
