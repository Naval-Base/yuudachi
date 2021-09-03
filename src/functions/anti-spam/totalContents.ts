import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { createHash } from 'crypto';

import { kRedis } from '../../tokens';
import { SPAM_EXPIRE_SECONDS } from '../../Constants';

export async function totalContent(content: string, guildId: string, userId: string): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);

	// TODO: fuzzy hashing to combat spam bots that slightly vary content

	const contentHash = createHash('md5').update(content.toLowerCase()).digest('hex');
	const channelSpamKey = `guild:${guildId}:user:${userId}:contenthash:${contentHash}`;
	const total = await redis.incr(channelSpamKey);
	await redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);
	return total;
}
