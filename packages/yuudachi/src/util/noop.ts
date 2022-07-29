import { logger } from '../logger.js';

export function noop(...args: any[]): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	logger.error('noop', ...args);
}
