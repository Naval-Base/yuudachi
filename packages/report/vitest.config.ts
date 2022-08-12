import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'happy-dom',
		exclude: ['**/node_modules', '**/dist', '.next'],
		passWithNoTests: true,
		coverage: {
			enabled: true,
			all: true,
			reporter: ['text', 'lcov', 'cobertura'],
			include: ['src'],
			exclude: [
				// All ts files that only contain types, due to ALL
				'**/*.{interface,type,d}.ts',
				// All index files that *should* only contain exports from other files
				'**/index.{js,ts}',
				// Excluding index files in pages/
				'!**/pages/**/index.ts',
			],
		},
	},
});
