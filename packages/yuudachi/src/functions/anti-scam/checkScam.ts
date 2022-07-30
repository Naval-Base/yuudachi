import { createHash } from 'node:crypto';
import { URL } from 'node:url';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { ScamRedisKeys, scamURLEnvs } from './refreshScamDomains.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { resolveRedirect } from '../../util/resolveRedirect.js';

interface ScamDomainHit {
	lists: string[];
	host: string;
	full: string;
}

const scamDomainChecks = {
	SCAM_DOMAIN_URL: (url: URL, host: string) => `.${url.host}`.endsWith(`.${host}`),
	SCAM_DOMAIN_DISCORD_URL: (url: URL, hash: string) => {
		const inHash = createHash('sha256').update(url.host).digest('hex');

		return hash === inHash;
	},
};

function urlOption(url: string) {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

async function checkDomain(redis: Redis, url: URL): Promise<ScamDomainHit | null> {
	const listHits: string[] = [];

	for (const urlEnv of scamURLEnvs) {
		const list = await redis.smembers(ScamRedisKeys[urlEnv]);
		const hit = list.find((d) => scamDomainChecks[urlEnv](url, d));

		if (hit) {
			listHits.push(urlEnv);
			continue;
		}
	}

	return listHits.length
		? {
				lists: listHits,
				host: url.host,
				full: url.href,
		  }
		: null;
}

export async function checkScam(content: string) {
	const redis = container.resolve<Redis>(kRedis);

	const linkRegex = /(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi;

	let matches: any[] | null = [];
	const trippedDomains: ScamDomainHit[] = [];

	while ((matches = linkRegex.exec(content)) !== null) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const url = urlOption(matches[0]);

		if (!url) {
			continue;
		}

		const hit = await checkDomain(redis, url);

		if (hit) {
			trippedDomains.push(hit);
		}

		if (!(await redis.sismember('linkshorteners', url.host))) {
			continue;
		}

		try {
			const r = await resolveRedirect(url.href);
			const resolved = urlOption(r);

			if (!resolved) {
				continue;
			}

			const hit = await checkDomain(redis, resolved);

			if (!hit) {
				continue;
			}

			trippedDomains.push(hit);
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
