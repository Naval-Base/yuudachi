module.exports = {
	testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
	testEnvironment: 'node',
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
	roots: ['<rootDir>packages/', '<rootDir>src/'],
	coveragePathIgnorePatterns: [
		'packages/api/dist/',
		'packages/core/dist/',
		'packages/http/dist/',
		'packages/rest/dist/',
		'packages/types/dist/',
	],
	setupFiles: ['./jest-setup.ts', 'jest-date-mock'],
};
