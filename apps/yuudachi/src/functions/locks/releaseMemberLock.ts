import { container, kRedis } from "@yuudachi/framework";
import type { GuildMember } from "discord.js";
import type { Redis } from "ioredis";

export async function releaseMemberLock(member: GuildMember): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const lockKey = `member-lock:${member.guild.id}:${member.id}`;

	await redis.del(lockKey);
}
