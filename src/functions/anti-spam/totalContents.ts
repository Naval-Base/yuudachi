import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { digest, similarity } from 'ctph.js';

import { kRedis } from '../../tokens';
import { SPAM_EXPIRE_SECONDS, SPAM_SIMILARITY_THRESHOLD } from '../../Constants';

export async function totalContent(content: string, guildId: string, userId: string): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);
	const contentHash = digest(content);

	const channelSpamKey = `guild:${guildId}:user:${userId}:spamCount`;
	const channelHashKey = `guild:${guildId}:user:${userId}:contenthash`;
	
	const lastHash = await redis.get(channelHashKey);
	const similarity = lastHash ? similarity(contentHash, lastHash) > SPAM_SIMILARITY_THRESHOLD : false;

	if (!lastHash) await redis.set(channelHashKey, contentHash, 'EX', SPAM_EXPIRE_SECONDS);

	if (similarity) {
			const total = await redis.incr(channelSpamKey);
			await redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);
			return total;
	};

	const total = await redis.get(channelSpamKey) || 0;
	return total;

}
