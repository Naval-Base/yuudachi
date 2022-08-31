import presetWebFonts from "@unocss/preset-web-fonts";
import { defineConfig, presetUno } from "unocss";

export default defineConfig({
	presets: [
		presetUno({ dark: "class" }),
		presetWebFonts({
			provider: "bunny",
			fonts: {
				sans: ["Inter"],
				mono: ["JetBrains Mono"],
			},
		}),
	],
});
