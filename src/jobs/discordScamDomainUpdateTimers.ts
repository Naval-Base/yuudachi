import fetch, { Response } from 'node-fetch';
import { parentPort } from 'node:worker_threads';
import Redis from 'ioredis';

import { logger } from '../logger';

function checkResponse(response: Response) {
	if (response.ok) return response;
	logger.warn({ response }, 'Fetching discord scam domain hashes returned a non 2xx response code.');
	process.exit(1);
}

const redis = new Redis(process.env.REDISHOST);

if (!process.env.SCAM_DOMAIN_DISCORD_URL) {
	logger.warn('Missing environment variable: SCAM_DOMAIN_DISCORD_URL.');
	process.exit(1);
}

const list = await fetch(process.env.SCAM_DOMAIN_DISCORD_URL)
	.then(checkResponse)
	.then((r) => r.json());
const before = await redis.scard('scamdomains_discord');
await redis.del('scamdomains_discord');
await redis.sadd('scamdomains_discord', ...list);
const after = await redis.scard('scamdomains_discord');
logger.info(
	{
		before,
		after,
	},
	'Discord Scam domain hashes updated (replaced)',
);

await redis.set('scamdomains_discord:refresh', Date.now());

if (parentPort) {
	parentPort.postMessage('done');
} else {
	process.exit(0);
}
