import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

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
				<link
					crossOrigin="anonymous"
					href="https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/base.min.css"
					integrity="sha512-Y3BvSXIyScMEFBi2QYvDc12tw0MpND6sYYKqdObiNlE432O1fv0/jeCbuuVeSNjd2ZuAM3EJbeVBFe/b0rKoYg=="
					referrerPolicy="no-referrer"
					rel="stylesheet"
				/>
				<link
					crossOrigin="anonymous"
					href="https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/color-modes.min.css"
					integrity="sha512-XTbUut8Rc/r06Iif/K7xDOub5F4TO2vTCV4InexCz5RvpGMaSfUf2tMRxYX6ha0zzFy+UfKdb94ehR+dOKYPhg=="
					referrerPolicy="no-referrer"
					rel="stylesheet"
				/>
				<link
					crossOrigin="anonymous"
					href="https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/utilities.min.css"
					integrity="sha512-OS48DOZqdQdDDxUfXtTx/xv8SjfIwc/k8gf75MaFh6uNb7xA50neIEvAi68wzvGJrW646ZVZH0AQXHSsvwMvpw=="
					referrerPolicy="no-referrer"
					rel="stylesheet"
				/>
				<link
					crossOrigin="anonymous"
					href="https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/markdown.min.css"
					integrity="sha512-z9fESt0h0bJJwWXYjGCV8v/SLbIkxgEIRBvt9d4xw+xSNUT+D1RpA/BUu8FBu6RqRWetBNaKeCC9Tr16/hPBhw=="
					referrerPolicy="no-referrer"
					rel="stylesheet"
				/>
				<link
					crossOrigin="anonymous"
					href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/github-dark.min.css"
					integrity="sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw=="
					referrerPolicy="no-referrer"
					rel="stylesheet"
				/>
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
