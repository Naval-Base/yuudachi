import { logger } from '../logger.js';

export function generateFormatterUrl(file: string) {
	if (!process.env.REPORT_FORMATTER_URL) {
		logger.info('Missing REPORT_FORMATTER_URL environment variable');
		// I will implement a static url on the API later, for now let's have some fun
		return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
	}

	const params: Record<string, string> = {
		url: file,
	};

	const urlQuery = new URLSearchParams(params);

	return `${process.env.REPORT_FORMATTER_URL}?${urlQuery.toString()}`;
}
