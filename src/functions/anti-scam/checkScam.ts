import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { URL } from 'node:url';
import { createHash } from 'node:crypto';

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

function checkAgainstDiscord(url: URL, hash: string) {
	const inHash = createHash('sha256').update(url.host).digest('hex');
	return hash === inHash;
}

export async function checkScam(content: string): Promise<string[]> {
	const redis = container.resolve<Redis>(kRedis);

	const linkRegex = /(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi;
	const scamDomains = await redis.smembers('scamdomains');
	const discordScamDomains = await redis.smembers('scamdomains_discord');
	const trippedDomains = [];

	let matches: any[] | null = [];
	while ((matches = linkRegex.exec(content)) !== null) {
		const url = urlOption(matches[0]);
		if (!url) {
			continue;
		}

		const phishHit = scamDomains.find((d) => checkAgainst(url, d));
		const discordHit = discordScamDomains.find((h) => checkAgainstDiscord(url, h));

		if (phishHit) {
			trippedDomains.push(phishHit);
			continue;
		}

		if (discordHit) {
			trippedDomains.push(discordHit);
		}

		try {
			const r = await resolveRedirect(url.href);
			const resolved = urlOption(r);
			if (!resolved) {
				continue;
			}

			const phishHit = scamDomains.find((d) => checkAgainst(resolved, d));
			const discordHit = discordScamDomains.find((h) => checkAgainstDiscord(resolved, h));

			if (phishHit) {
				trippedDomains.push(phishHit);
			}

			if (discordHit) {
				trippedDomains.push(discordHit);
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
