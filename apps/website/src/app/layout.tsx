import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

import "@unocss/reset/tailwind.css";
import "../styles/unocss.css";
import "../styles/main.css";

export const metadata: Metadata = {
	title: "Yuudachi",
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
		{ media: "(prefers-color-scheme: dark)", color: "#181818" },
	],
	colorScheme: "light dark",

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
			<body className="dark:bg-dark-800 bg-white">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
