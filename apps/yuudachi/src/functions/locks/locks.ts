import { container, kRedis } from "@yuudachi/framework";
import type { LocaleParam } from "@yuudachi/framework/types";
import type { GuildMember } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { Counter } from "prom-client";
import { MEMBER_LOCK_EXPIRE_SECONDS } from "../../Constants.js";

const lockCounter = new Counter({
	name: "yuudachi_bot_v3_utils_locks_acquire_member_lock_total",
	help: "Total locks acquired",
	labelNames: ["memberId", "guildId"],
});

export async function acquireMemberLock(member: GuildMember, locale: LocaleParam, override = false): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `member-lock:${member.guild.id}:${member.id}`;

	const lock = await redis.set(lockKey, member.user.createdTimestamp, "EX", MEMBER_LOCK_EXPIRE_SECONDS, "NX");

	if (!lock && !override) {
		throw new Error(
			i18next.t("command.common.errors.member_lock_acquired", {
				lng: locale,
			}),
		);
	}

	lockCounter.inc({ memberId: member.id, guildId: member.guild.id });
}

export async function extendMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `member-lock:${member.guild.id}:${member.id}`;

	await redis.expire(lockKey, MEMBER_LOCK_EXPIRE_SECONDS, "GT");
}

export async function releaseMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `member-lock:${member.guild.id}:${member.id}`;

	await redis.del(lockKey);
}
