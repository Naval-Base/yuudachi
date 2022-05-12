import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { checkScam } from './checkScam';
import { SCAM_EXPIRE_SECONDS } from '../../Constants';
import { kRedis } from '../../tokens';

export async function totalScams(content: string, guildId: string, userId: string): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);

	const scamKey = `guild:${guildId}:user:${userId}:scams`;
	const hitDomains = await checkScam(content);

	const total = redis.incrby(scamKey, hitDomains.length ? 1 : 0);
	await redis.expire(scamKey, SCAM_EXPIRE_SECONDS);
	return total;
}
