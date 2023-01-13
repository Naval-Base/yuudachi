import { clearTimeout } from "node:timers";
import { container, kRedis } from "@yuudachi/framework";
import type { LocaleParam } from "@yuudachi/framework/types";
import type { GuildMember } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { MEMBER_LOCK_EXPIRE_SECONDS } from "../../Constants.js";
import { createLockTimeout } from "./utils.js";

const LocksMap = new Map<string, NodeJS.Timeout>();

export async function acquireMemberLock(member: GuildMember, locale: LocaleParam): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `guild:${member.guild.id}:member-lock:${member.id}`;

	const lock = await redis.set(lockKey, member.user.createdTimestamp, "EX", MEMBER_LOCK_EXPIRE_SECONDS, "NX");

	if (!lock) {
		throw new Error(
			i18next.t("command.common.errors.member_lock_acquired", {
				lng: locale,
			}),
		);
	}

	LocksMap.set(lockKey, createLockTimeout(member, LocksMap));
}

export async function extendMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `guild:${member.guild.id}:member-lock:${member.id}`;

	await redis.expire(lockKey, MEMBER_LOCK_EXPIRE_SECONDS, "GT");

	const lock = LocksMap.get(lockKey);

	if (lock) {
		clearTimeout(lock);
		LocksMap.set(lockKey, createLockTimeout(member, LocksMap));
	}
}

export async function releaseMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `guild:${member.guild.id}:member-lock:${member.id}`;

	await redis.del(lockKey);

	const lock = LocksMap.get(lockKey);
	clearTimeout(lock);
	LocksMap.delete(lockKey);
}
