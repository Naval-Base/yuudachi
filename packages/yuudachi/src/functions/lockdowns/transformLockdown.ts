import type { PermissionOverwrites, Snowflake } from "discord.js";
import type { Lockdown } from "./createLockdown.js";

export type RawLockdown = {
	channel_id: Snowflake;
	expiration: string;
	guild_id: Snowflake;
	mod_id: Snowflake;
	mod_tag: string;
	overwrites: PermissionOverwrites[];
	reason?: string | null | undefined;
};

export function transformLockdown(case_: RawLockdown): Lockdown {
	return {
		guildId: case_.guild_id,
		channelId: case_.channel_id,
		expiration: case_.expiration,
		reason: case_.reason,
		modId: case_.mod_id,
		modTag: case_.mod_tag,
		overwrites: case_.overwrites,
	} as const;
}
