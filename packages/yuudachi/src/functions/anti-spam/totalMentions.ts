import type { Snowflake } from "discord.js";
import type { Redis } from "ioredis";
import { container } from "tsyringe";
import { MENTION_EXPIRE_SECONDS } from "../../Constants.js";
import { kRedis } from "../../tokens.js";

export async function totalMentions(guildId: Snowflake, userId: Snowflake, content: string) {
	const redis = container.resolve<Redis>(kRedis);
	const parsed = new Set<Snowflake>();

	for (const mention of content.matchAll(/<@(?<userId>\d{17,20})>/g)) {
		const id = mention.groups?.userId;

		if (id) {
			parsed.add(id);
		}
	}

	const attemptAtEveryoneOrHere = ["@everyone", "@here"].some((pattern) => content.includes(pattern));
	const mentionCountKey = `guild:${guildId}:user:${userId}:mentions`;
	const increment = parsed.size + (attemptAtEveryoneOrHere ? 1 : 0);

	const total = await redis.incrby(mentionCountKey, increment);

	if (total === increment) {
		await redis.expire(mentionCountKey, MENTION_EXPIRE_SECONDS);
	}

	return total;
}
