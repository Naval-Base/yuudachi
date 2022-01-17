import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { createHash } from 'crypto';
import { digest, similarity } from 'ctph.js';

import { kRedis } from '../../tokens';
import { SPAM_EXPIRE_SECONDS, SPAM_HASH_THRESHOLD } from '../../Constants';

export function createContentHash(content: string) {
	return createHash('md5').update(content.toLowerCase()).digest('hex');
}

export async function totalContent(content: string, guildId: string, userId: string): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);

	const contentHash = digest(content);

	const channelLasthashKey = `guild:${guildId}:user:${userId}:lastHash`;
	const channelSpamKey = `guild:${guildId}:user:${userId}:spamCount`;

	const lastHash = await redis.get(channelLasthashKey);

	if (!lastHash) await redis.set(channelLasthashKey, contentHash, 'EX', SPAM_EXPIRE_SECONDS);

	if (
		!lastHash ||
		lastHash === contentHash ||
		(lastHash ? similarity(lastHash, contentHash) > SPAM_HASH_THRESHOLD : false)
	) {
		const total = await redis.incr(channelSpamKey);
		await redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);
		return total;
	}

	return (await redis.get(channelSpamKey)) ?? 0;
}
