import type { Snowflake } from 'discord.js';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { checkScam } from './checkScam.js';
import { SCAM_EXPIRE_SECONDS } from '../../Constants.js';
import { kRedis } from '../../tokens.js';

export async function totalScams(content: string, guildId: Snowflake, userId: Snowflake): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);

	const scamKey = `guild:${guildId}:user:${userId}:scams`;
	const hitDomains = await checkScam(content);
	const total = redis.incrby(scamKey, hitDomains.length ? 1 : 0);
	await redis.expire(scamKey, SCAM_EXPIRE_SECONDS);

	return total;
}
