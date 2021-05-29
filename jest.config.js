/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
	testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	coverageThreshold: {
		global: {
			branches: 70,
			lines: 70,
			statements: 70,
		},
	},
	roots: ['<rootDir>packages/', '<rootDir>src/'],
	coveragePathIgnorePatterns: [
		'packages/api/dist/',
		'packages/core/dist/',
		'packages/http/dist/',
		'packages/rest/dist/',
		'packages/types/dist/',
		'packages/core/src/managers/index.ts',
		'src/api/src/middleware/index.ts',
		'src/handler/src/util/index.ts',
	],
	setupFiles: ['./jest-setup.ts', 'jest-date-mock'],
};
