import fetch from 'node-fetch';
import { logger } from '../logger';
import { parentPort } from 'node:worker_threads';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDISHOST);
const list = await fetch(process.env.SCAM_DOMAIN_URL!).then((r) => r.json());
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
