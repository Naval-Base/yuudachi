import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";

export default defineProject({
	plugins: [react()],
	test: {
		environment: "happy-dom",
		exclude: ["**/node_modules/**", "**/dist/**", ".next"],
	},
});
