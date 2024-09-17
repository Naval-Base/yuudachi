import { container, kRedis } from "@yuudachi/framework";
import type { Redis } from "ioredis";

export async function checkMemberLock(guildId: string, memberId: string): Promise<boolean> {
	const redis = container.resolve<Redis>(kRedis);

	const key = `guild:${guildId}:member-lock:${memberId}`;

	const lock = await redis.exists(key);

	return Boolean(lock);
}
