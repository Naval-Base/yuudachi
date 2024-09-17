import { kSQL } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { SerializableParameter, Sql } from "postgres";
import { container } from "tsyringe";
import type { SettingsKeys, ReportStatusTagTuple, ReportTypeTagTuple } from "./getGuildSetting.js";

export async function updateGuildSetting<T = string>(
	guildId: Snowflake,
	prop: SettingsKeys,
	newValue: T,
	table = "guild_settings",
) {
	const sql = container.resolve<Sql<{}>>(kSQL);

	const [data] = await sql.unsafe<[{ value: ReportStatusTagTuple | ReportTypeTagTuple | boolean | string | null }?]>(
		`update ${table} set ${prop} = $2
		where guild_id = $1`,
		[guildId, newValue] as SerializableParameter[],
	);

	return (data?.value ?? null) as unknown as T;
}
