import type { AppProps } from "next/app";
import NextProgress from "next-progress";
import { ThemeProvider } from "next-themes";
import "@unocss/reset/tailwind.css";
import "../styles/unocss.css";
import "../styles/cmdk.css";
import "../styles/main.css";

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			disableTransitionOnChange
			value={{
				light: "light",
				dark: "dark",
			}}
		>
			<NextProgress color="#5865f2" options={{ showSpinner: false }} />
			<Component {...pageProps} />
		</ThemeProvider>
	);
}
