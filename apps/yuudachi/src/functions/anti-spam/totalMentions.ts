import { kRedis, container } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import { FormattingPatterns } from "discord.js";
import type { Redis } from "ioredis";
import { MENTION_EXPIRE_SECONDS } from "../../Constants.js";
import { removeCodeBlocks } from "../../util/codeBlock.js";

export async function totalMentions(guildId: Snowflake, userId: Snowflake, content: string) {
	const redis = container.get<Redis>(kRedis);
	const parsed = new Set<Snowflake>();

	const filtered = removeCodeBlocks(content);

	for (const mention of filtered.matchAll(new RegExp(FormattingPatterns.User, "g"))) {
		const id = mention.groups?.id;

		if (id) {
			parsed.add(id);
		}
	}

	const attemptAtEveryoneOrHere = ["@everyone", "@here"].some((pattern) => filtered.includes(pattern));
	const mentionCountKey = `guild:${guildId}:user:${userId}:mentions`;
	const increment = parsed.size + (attemptAtEveryoneOrHere ? 1 : 0);

	const total = await redis.incrby(mentionCountKey, increment);

	if (total === increment) {
		await redis.expire(mentionCountKey, MENTION_EXPIRE_SECONDS);
	}

	return total;
}
