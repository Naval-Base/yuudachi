import type { Redis } from 'ioredis';
import { kRedis } from '../../tokens';
import { container } from 'tsyringe';

export async function checkScam(content: string): Promise<string[]> {
	const redis = container.resolve<Redis>(kRedis);

	const scamDomains = await redis.smembers('scamdomains');
	return scamDomains.filter((domain) => content.toLowerCase().includes(domain));
}
