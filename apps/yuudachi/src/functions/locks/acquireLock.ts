import { container, kRedis } from "@yuudachi/framework";
import type { LocaleParam } from "@yuudachi/framework/types";
import type { GuildMember } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { LOCK_MAP_TOKEN, MEMBER_LOCK_INITIAL_EXPIRE_SECONDS } from "../../Constants.js";
import { memberToLockKey, createLockTimeout } from "./utils.js";

export async function acquireMemberLock(member: GuildMember, locale: LocaleParam): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);
	const lockMap = container.resolve<Map<string, NodeJS.Timeout>>(LOCK_MAP_TOKEN);

	const key = memberToLockKey(member);

	const lock = await redis.set(key, member.user.createdTimestamp, "EX", MEMBER_LOCK_INITIAL_EXPIRE_SECONDS, "NX");

	if (!lock) {
		throw new Error(
			i18next.t("command.common.errors.member_lock_acquired", {
				lng: locale,
			}),
		);
	}

	lockMap.set(key, createLockTimeout(member, lockMap));
}
