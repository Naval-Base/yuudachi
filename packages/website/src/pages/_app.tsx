import type { AppProps } from "next/app";
import "@unocss/reset/sanitize/sanitize.css";
import "@unocss/reset/sanitize/assets.css";

export default function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
