import process from 'node:process';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { request as fetch, type Dispatcher } from 'undici';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';

export const scamURLEnvs = ['SCAM_DOMAIN_URL', 'SCAM_DOMAIN_DISCORD_URL'] as const;
export enum ScamRedisKeys {
	SCAM_DOMAIN_DISCORD_URL = 'scamdomains_discord',
	SCAM_DOMAIN_URL = 'scamdomains',
}

export type ScamDomainRefreshData = {
	after: number;
	before: number;
	envVar: string;
	lastRefresh: number;
	redisKey: string;
};

export function checkResponse(response: Dispatcher.ResponseData) {
	if (response.statusCode >= 200 && response.statusCode < 300) {
		return response;
	}

	logger.warn({ response }, 'Fetching scam domains returned a non 2xx response code.');

	return null;
}

export const scamDomainRequestHeaders = {
	SCAM_DOMAIN_URL: {
		'X-Identity': 'Naval-Base/yuudachi',
	},
	SCAM_DOMAIN_DISCORD_URL: {},
} as const;

export async function refreshScamDomains(redis?: Redis | undefined) {
	let localRedis = redis;
	if (!redis) {
		localRedis = container.resolve<Redis>(kRedis);
	}

	const res: ScamDomainRefreshData[] = [];

	for (const urlEnvironment of scamURLEnvs) {
		const url = process.env[urlEnvironment];

		if (!url) {
			logger.warn(`Missing env var: ${urlEnvironment}`);
			continue;
		}

		const response = await fetch(process.env[urlEnvironment]!, {
			headers: scamDomainRequestHeaders[urlEnvironment],
		});
		const checkedResponse = checkResponse(response);

		if (!checkedResponse) {
			continue;
		}

		const list = (await checkedResponse.body.json()) as string[];

		switch (urlEnvironment) {
			case 'SCAM_DOMAIN_DISCORD_URL':
			case 'SCAM_DOMAIN_URL': {
				const key = ScamRedisKeys[urlEnvironment];
				// @ts-expect-error: Redis types are awful
				const [[, lastRefresh], [, before], , , [, after]] = await localRedis
					.multi()
					.get(`${key}:refresh`)
					.scard(key)
					.del(key)
					.sadd(key, ...list)
					.scard(key)
					.set(`${key}:refresh`, Date.now())
					.exec();

				const lastRefreshTimestamp = Number.parseInt(lastRefresh, 10);

				logger.info({
					msg: 'refreshd scam domains',
					envVar: urlEnvironment,
					redisKey: key,
					lastRefresh: lastRefreshTimestamp,
					before,
					after,
				});

				res.push({
					envVar: urlEnvironment,
					redisKey: key,
					lastRefresh: lastRefreshTimestamp,
					before,
					after,
				});
				break;
			}

			default:
				break;
		}
	}

	return res;
}
