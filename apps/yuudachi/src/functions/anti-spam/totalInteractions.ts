import { kRedis, container } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { Redis } from "ioredis";
import { INTERACTION_SPAM_EXPIRE_SECONDS } from "../../Constants.js";

export async function totalInteractionMessages(guildId: Snowflake, userId: Snowflake) {
	const redis = container.get<Redis>(kRedis);
	const key = `guild:${guildId}:user:${userId}:interactions`;

	const total = await redis.incr(key);
	await redis.expire(key, INTERACTION_SPAM_EXPIRE_SECONDS);

	return total;
}
