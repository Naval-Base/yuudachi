import { container, kRedis } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { Redis } from "ioredis";

/**
 * Lock TTL in seconds - how long before the lock auto-expires.
 * Should be longer than the confirmation timeout (15s) to cover the full command flow.
 */
const LOCK_TTL_SECONDS = 30;

/**
 * Attempts to acquire a lock on a member.
 * Uses Redis SETNX for atomic lock acquisition to prevent race conditions
 * when multiple moderators try to action the same user simultaneously.
 *
 * @param guildId - The guild ID
 * @param memberId - The target member ID
 * @returns `true` if lock was acquired, `false` if another moderator is already processing
 */
export async function tryAcquireMemberLock(guildId: Snowflake, memberId: Snowflake) {
	const redis = container.get<Redis>(kRedis);
	const lockKey = `guild:${guildId}:user:${memberId}:lock`;

	// SETNX returns "OK" if the key was set (lock acquired), null if it already exists (lock not acquired)
	const result = await redis.set(lockKey, Date.now().toString(), "EX", LOCK_TTL_SECONDS, "NX");

	return result === "OK";
}

/**
 * Extends the TTL of an existing member lock.
 * Call this when the moderator confirms the action to ensure the lock
 * doesn't expire during the action execution.
 *
 * @param guildId - The guild ID
 * @param memberId - The target member ID
 */
export async function extendMemberLock(guildId: Snowflake, memberId: Snowflake) {
	const redis = container.get<Redis>(kRedis);
	const lockKey = `guild:${guildId}:user:${memberId}:lock`;

	await redis.expire(lockKey, LOCK_TTL_SECONDS);
}
