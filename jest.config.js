/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
	testMatch: ['<rootDir>/src/**/*.test.ts'],
	testEnvironment: 'node',
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.ts'],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	setupFiles: ['./jest-setup.ts'],
};
