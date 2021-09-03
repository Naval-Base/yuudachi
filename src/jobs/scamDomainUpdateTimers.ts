import fetch, { Response } from 'node-fetch';
import { parentPort } from 'node:worker_threads';
import Redis from 'ioredis';

import { logger } from '../logger';

function checkResponse(response: Response) {
	if (response.ok) return response;
	logger.warn({ response }, 'Fetching scam domains returned a non 2xx response code.');
	process.exit(1);
}

const redis = new Redis(process.env.REDISHOST);

if (!process.env.SCAM_DOMAIN_URL) {
	logger.warn('Missing environment variable: SCAM_DOMAIN_URL.');
	process.exit(1);
}

const list = await fetch(process.env.SCAM_DOMAIN_URL)
	.then(checkResponse)
	.then((r) => r.json());
const before = await redis.scard('scamdomains');

await redis.sadd('scamdomains', ...list);
const after = await redis.scard('scamdomains');
logger.info(
	{
		before,
		after,
	},
	'Scam domains updated',
);
if (parentPort) {
	parentPort.postMessage('done');
} else {
	process.exit(0);
}
