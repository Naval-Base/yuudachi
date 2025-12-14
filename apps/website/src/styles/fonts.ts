import { Roboto_Flex, JetBrains_Mono } from "next/font/google";

export const roboto = Roboto_Flex({
	subsets: ["latin"],
	display: "swap",
	axes: ["opsz", "slnt", "wdth"],
	variable: "--font-roboto",
});

export const jetBrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-mono",
});
