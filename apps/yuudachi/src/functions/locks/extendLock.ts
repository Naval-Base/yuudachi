import { container, kRedis } from "@yuudachi/framework";
import type { GuildMember } from "discord.js";
import type { Redis } from "ioredis";
import { LOCK_MAP_TOKEN, MEMBER_LOCK_EXPIRE_SECONDS } from "../../Constants.js";
import { memberToLockKey, createLockTimeout } from "./utils.js";

export async function extendMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);
	const lockMap = container.resolve<Map<string, NodeJS.Timeout>>(LOCK_MAP_TOKEN);

	const key = memberToLockKey(member);

	await redis.expire(key, MEMBER_LOCK_EXPIRE_SECONDS, "GT");

	const lock = lockMap.get(key);

	if (lock) {
		clearTimeout(lock);
		lockMap.set(key, createLockTimeout(member, lockMap));
	}
}
