import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { StyleSheets } from "./stylesheets";

import "~/styles/main.css";

export const metadata: Metadata = {
	title: "Yuudachi Report",
	viewport: {
		minimumScale: 1,
		initialScale: 1,
		width: "device-width",
	},
	icons: {
		other: [
			{
				url: "/favicon-32x32.png",
				sizes: "32x32",
				type: "image/png",
			},
			{
				url: "/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png",
			},
		],
		apple: [
			"/apple-touch-icon.png",
			{
				url: "/safari-pinned-tab.svg",
				rel: "mask-icon",
			},
		],
	},

	manifest: "/site.webmanifest",

	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0d1117" },
	],
	colorScheme: "light dark",

	appleWebApp: {
		title: "Yuudachi Report",
	},

	applicationName: "Yuudachi Report",

	openGraph: {
		siteName: "Yuudachi Report",
		type: "website",
		title: "Yuudachi Report",
	},

	twitter: {
		card: "summary_large_image",
		creator: "@iCrawlToGo",
	},

	other: {
		"msapplication-TileColor": "#0d1117",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html data-color-mode="dark" data-dark-theme="dark" lang="en">
			<body>
				<StyleSheets />
				<script
					// eslint-disable-next-line react/no-danger
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
				{children}
			</body>
		</html>
	);
}
