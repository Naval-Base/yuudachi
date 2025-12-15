import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";
import { jetBrainsMono, roboto } from "@/styles/fonts";
import { Providers } from "./providers";

import "overlayscrollbars/overlayscrollbars.css";
import "@/styles/base.css";

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#181818" },
	],
	colorScheme: "light dark",
};

export const metadata: Metadata = {
	title: {
		default: "Yuudachi",
		template: "%s | Yuudachi",
	},
	description: "",

	applicationName: "Yuudachi",

	openGraph: {
		title: "Yuudachi",
		description: "",
		siteName: "Yuudachi",
		type: "website",
	},

	appleWebApp: {
		title: "Yuudachi",
	},

	twitter: {
		card: "summary_large_image",
		creator: "@iCrawlToGo",
	},
};

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html className={`${roboto.variable} ${jetBrainsMono.variable} antialiased`} lang="en" suppressHydrationWarning>
			<body className="bg-base-neutral-0 text-base-md text-base-neutral-900 dark:bg-base-neutral-900 dark:text-base-neutral-40 overscroll-y-none">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
