import { default as Redis } from 'ioredis';
import { container } from 'tsyringe';
import { kRedis } from '../tokens.js';

export function createRedis(): Redis {
	const redis = new Redis(process.env.REDISHOST!);
	container.register(kRedis, { useValue: redis });

	return redis;
}
