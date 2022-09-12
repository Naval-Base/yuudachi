/* eslint-disable react/no-danger */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head />
			<body className="dark:bg-dark-800 bg-white">
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
