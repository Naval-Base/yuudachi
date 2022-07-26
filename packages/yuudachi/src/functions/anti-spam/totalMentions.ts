import type { Message } from 'discord.js';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { MENTION_EXPIRE_SECONDS } from '../../Constants.js';
import { kRedis } from '../../tokens.js';

export async function totalMentions(message: Message): Promise<number> {
	const redis = container.resolve<Redis>(kRedis);

	const attemptAtEveryoneOrHere = ['@everyone', '@here'].some((pattern) => message.content.includes(pattern));
	const mentionCountKey = `guild:${message.guild!.id}:user:${message.author.id}:mentions`;
	const increment = message.mentions.users.size + (attemptAtEveryoneOrHere ? 1 : 0);

	const total = await redis.incrby(mentionCountKey, increment);

	if (total === increment) {
		await redis.expire(mentionCountKey, MENTION_EXPIRE_SECONDS);
	}

	return total;
}
