import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { URL } from 'node:url';

import { logger } from '../../logger';
import { kRedis } from '../../tokens';
import { resolveRedirect } from '../../util/resolveRedirect';

function urlOption(url: string): URL | null {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

function checkAgainst(url: URL, host: string) {
	return `.${url.host}`.endsWith(`.${host}`);
}

export async function checkScam(content: string): Promise<string[]> {
	const redis = container.resolve<Redis>(kRedis);

	const linkRegex = /(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi;
	const scamDomains = await redis.smembers('scamdomains');
	const trippedDomains = [];

	let matches: any[] | null = [];
	while ((matches = linkRegex.exec(content)) !== null) {
		const url = urlOption(matches[0]);
		if (!url) {
			continue;
		}

		const hit = scamDomains.find((d) => checkAgainst(url, d));

		if (hit) {
			trippedDomains.push(hit);
			continue;
		}

		try {
			const r = await resolveRedirect(url.href);
			const resolved = urlOption(r);
			if (!resolved) {
				continue;
			}

			const hit = scamDomains.find((d) => checkAgainst(resolved, d));

			if (hit) {
				trippedDomains.push(hit);
			}
		} catch (e) {
			const error = e as Error;
			logger.error(error, error.message);
		}
	}

	if (trippedDomains.length) {
		logger.info({
			msg: 'Found scam domains',
			content,
			trippedDomains,
		});
	}

	return trippedDomains;
}
