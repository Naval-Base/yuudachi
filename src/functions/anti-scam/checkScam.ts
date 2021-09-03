import type { Redis } from 'ioredis';
import { container } from 'tsyringe';

import { kRedis } from '../../tokens';

export async function checkScam(content: string): Promise<string[]> {
	const redis = container.resolve<Redis>(kRedis);

	const scamDomains = await redis.smembers('scamdomains');
	return scamDomains.filter((domain) => content.toLowerCase().includes(domain));
}
