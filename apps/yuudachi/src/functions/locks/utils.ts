import { setTimeout } from "node:timers";
import { logger } from "@yuudachi/framework";
import type { GuildMember } from "discord.js";
import { Counter } from "prom-client";

const expiredLocksCounter = new Counter({
	name: "yuudachi_bot_v3_utils_expired_locks_total",
	help: "Total number of unreleased keys that expired",
	labelNames: ["memberId", "guildId"],
});

export function memberToLockKey(member: GuildMember): `guild:${string}:member-lock:${string}` {
	return `guild:${member.guild.id}:member-lock:${member.id}`;
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
