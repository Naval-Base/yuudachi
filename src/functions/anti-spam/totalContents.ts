import { createHash } from 'crypto';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { SPAM_EXPIRE_SECONDS } from '../../Constants';
import { kRedis } from '../../tokens';

export function createContentHash(content: string) {
	return createHash('md5').update(content.toLowerCase()).digest('hex');
}

export async function totalContent(content: string, guildId: string, userId: string): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);

	const contentHash = createContentHash(content);
	const channelSpamKey = `guild:${guildId}:user:${userId}:contenthash:${contentHash}`;
	const total = await redis.incr(channelSpamKey);
	await redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);
	return total;
}
