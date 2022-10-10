import { defineConfig, presetUno, presetWebFonts } from "unocss";

export default defineConfig({
	presets: [
		presetUno({ dark: "class" }),
		presetWebFonts({
			provider: "bunny",
			fonts: {
				mono: ["JetBrains Mono:400,600,700"],
			},
		}),
	],
});
