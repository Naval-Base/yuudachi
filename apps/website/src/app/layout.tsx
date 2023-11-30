import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

import "@unocss/reset/tailwind.css";
import "../styles/unocss.css";
import "../styles/main.css";

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#181818" },
	],
	colorScheme: "light dark",
};

export const metadata: Metadata = {
	title: "Yuudachi",
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

	appleWebApp: {
		title: "Yuudachi",
	},

	applicationName: "Yuudachi",

	openGraph: {
		siteName: "Yuudachi",
		type: "website",
		title: "Yuudachi",
	},

	twitter: {
		card: "summary_large_image",
		creator: "@iCrawlToGo",
	},

	other: {
		"msapplication-TileColor": "#181818",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-light-600 dark:bg-dark-600 dark:text-light-600">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
