import { kSQL, container } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { type RawLockdown, transformLockdown } from "./transformLockdown.js";

export async function getLockdown(guildId: Snowflake, channelId: Snowflake) {
	const sql = container.get<Sql<any>>(kSQL);

	const [lockdown] = await sql<[RawLockdown?]>`
		select *
		from lockdowns
		where guild_id = ${guildId}
			and channel_id = ${channelId}
	`;

	if (!lockdown) {
		return null;
	}

	return transformLockdown(lockdown);
}
