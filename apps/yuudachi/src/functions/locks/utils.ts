import { setTimeout } from "node:timers";
import { container, kRedis, logger } from "@yuudachi/framework";
import type { GuildMember } from "discord.js";
import type { Redis } from "ioredis";
import { Counter } from "prom-client";

const expiredLocksCounter = new Counter({
	name: "yuudachi_bot_v3_utils_expired_locks_total",
	help: "Total number of unreleased keys that expired",
	labelNames: ["memberId", "guildId"],
});

export async function checkMemberLock(guildId: string, memberId: string): Promise<boolean> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `guild:${guildId}:member-lock:${memberId}`;

	const lock = await redis.exists(lockKey);

	return Boolean(lock);
}

export function createLockTimeout(member: GuildMember, map: Map<string, NodeJS.Timeout>): NodeJS.Timeout {
	const lockKey = `guild:${member.guild.id}:member-lock:${member.id}`;

	return setTimeout(() => {
		logger.warn({
			msg: "Lock expired",
			memberId: member.id,
			guildId: member.guild.id,
			lockKey,
		});

		expiredLocksCounter.inc({
			memberId: member.id,
			guildId: member.guild.id,
		});

		map.delete(lockKey);
	}, 60_000);
}
