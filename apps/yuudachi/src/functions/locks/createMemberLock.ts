import { container, kRedis, logger } from "@yuudachi/framework";
import type { LocaleParam } from "@yuudachi/framework/types";
import type { GuildMember } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { MEMBER_LOCK_EXPIRE_SECONDS } from "../../Constants.js";

export async function createMemberLock(member: GuildMember, locale: LocaleParam): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `member-lock:${member.guild.id}:${member.id}`;

	const lock = await redis.set(lockKey, member.user.createdTimestamp, "EX", MEMBER_LOCK_EXPIRE_SECONDS, "NX");

	if (!lock) {
		throw new Error(
			i18next.t("command.common.errors.member_lock_acquired", {
				lng: locale,
			}),
		);
	}

	logger.debug({
		msg: "Member lock acquired",
		lockKey,
		expire: MEMBER_LOCK_EXPIRE_SECONDS,
	});
}
