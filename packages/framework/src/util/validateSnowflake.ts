import type { Snowflake } from "discord-api-types/v10";

export function validateSnowflake(id: Snowflake) {
	return /^\d{17,20}$/.test(id);
}
