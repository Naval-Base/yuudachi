import { container, kRedis } from "@yuudachi/framework";
import type { GuildMember } from "discord.js";
import type { Redis } from "ioredis";
import { memberToLockKey } from "./utils.js";
import { LOCK_MAP_TOKEN } from "../../Constants.js";

export async function releaseMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);
	const lockMap = container.resolve<Map<string, NodeJS.Timeout>>(LOCK_MAP_TOKEN);

	const key = memberToLockKey(member);

	await redis.del(key);

	const lock = lockMap.get(key);
	clearTimeout(lock);
	lockMap.delete(key);
}
