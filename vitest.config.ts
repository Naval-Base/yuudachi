import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: ["apps/*/vitest.config.ts", "packages/*/vitest.config.ts"],
		passWithNoTests: true,
		exclude: ["**/node_modules/**", "**/dist/**"],
		coverage: {
			enabled: true,
			provider: "v8",
			reporter: ["text", "lcov", "cobertura"],
			include: ["apps/*/src/**/*.{ts,tsx}", "packages/*/src/**/*.{ts,tsx}"],
			exclude: ["**/*.{interface,type,d}.ts", "**/index.{js,ts}"],
		},
	},
});
