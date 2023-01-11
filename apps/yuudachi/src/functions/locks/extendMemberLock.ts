import { container, kRedis, logger } from "@yuudachi/framework";
import type { GuildMember } from "discord.js";
import type { Redis } from "ioredis";
import { MEMBER_LOCK_EXPIRE_SECONDS } from "../../Constants.js";

export async function extendMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `member-lock:${member.guild.id}:${member.id}`;

	await redis.expire(lockKey, MEMBER_LOCK_EXPIRE_SECONDS, "GT");

	logger.debug({
		msg: "Member lock extended",
		lockKey,
		expire: MEMBER_LOCK_EXPIRE_SECONDS,
	});
}
