import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { URL } from 'node:url';

import { logger } from '../../logger';
import { kRedis } from '../../tokens';
import { resolveRedirect } from '../../util/resolveRedirect';

export async function checkScam(content: string): Promise<string[]> {
	const redis = container.resolve<Redis>(kRedis);

	const linkRegex = /(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi;
	const scamDomains = await redis.smembers('scamdomains');
	const trippedDomains = [];

	let matches: any[] | null = [];
	while ((matches = linkRegex.exec(content)) !== null) {
		const url = new URL(matches[0]);
		const hit = scamDomains.find((d) => url.host.endsWith(d));

		if (hit) {
			trippedDomains.push(hit);
			continue;
		}

		try {
			const r = await resolveRedirect(url.href);
			const resolved = new URL(r);
			const hit = scamDomains.find((domain) => resolved.host.endsWith(domain));

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
