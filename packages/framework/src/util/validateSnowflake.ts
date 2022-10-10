import type { Snowflake } from "discord.js";

export function validateSnowflake(id: Snowflake) {
	return /^\d{17,20}$/.test(id);
}
