import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		environment: "node",
		exclude: ["**/node_modules/**", "**/dist/**"],
		setupFiles: ["./__tests__/setup.ts"],
	},
});
