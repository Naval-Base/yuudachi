import { logger } from '../../logger.js';

export function generateFormatterUrl(file: string) {
	if (!process.env.REPORT_FORMATTER_URL) {
		logger.info('Missing REPORT_FORMATTER_URL environment variable');
		return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
	}

	const params: Record<string, string> = {
		url: file,
	};

	const url = new URL(process.env.REPORT_FORMATTER_URL!);
	Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

	return url.toString();
}
