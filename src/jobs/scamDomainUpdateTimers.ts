import { parentPort } from 'node:worker_threads';
import Redis from 'ioredis';
import { refreshScamDomains } from '../functions/anti-scam/refreshScamDomains';
const redis = new Redis(process.env.REDISHOST!);
await refreshScamDomains(redis);

if (parentPort) {
	parentPort.postMessage('done');
} else {
	process.exit(0);
}
