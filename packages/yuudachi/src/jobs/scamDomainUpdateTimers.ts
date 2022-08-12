import process from 'node:process';
import { parentPort } from 'node:worker_threads';
import { refreshScamDomains } from '../functions/anti-scam/refreshScamDomains.js';
import { createRedis } from '../util/redis.js';

const redis = createRedis(false);
await refreshScamDomains(redis);

if (parentPort) {
	parentPort.postMessage('done');
} else {
	process.exit(0);
}
