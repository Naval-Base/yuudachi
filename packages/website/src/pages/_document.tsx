/* eslint-disable react/no-danger */
import { Html, Head, Main, NextScript } from "next/document";
import { globalCss, getCssText } from "../../stitches.config";

const globalStyles = globalCss({ html: { backgroundColor: "$gray1" } });

export default function Document() {
	globalStyles();

	return (
		<Html lang="en">
			<Head>
				<style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
			</Head>
			<body>
				<script
					dangerouslySetInnerHTML={{
						__html: `(() => {
							const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
							const persistedColorPreference = localStorage.getItem('theme') || 'auto';
							if (persistedColorPreference === 'dark' || (prefersDarkMode && persistedColorPreference !== 'light')) {
								document.documentElement.classList.toggle('dark', true);
							}
						})();`,
					}}
				/>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
