import type { Snowflake } from "discord.js";
import type { Appeal } from "./createAppeal.js";

export type RawAppeal = {
	appeal_id: number;
	created_at: string;
	guild_id: Snowflake;
	mod_id: Snowflake | null;
	mod_tag: string | null;
	reason: string;
	ref_id: number | null;
	status: number;
	target_id: Snowflake;
	target_tag: string;
	updated_at: string | null;
};

export function transformAppeal(appeal: RawAppeal): Appeal {
	return {
		guildId: appeal.guild_id,
		appealId: appeal.appeal_id,
		status: appeal.status,
		targetId: appeal.target_id,
		targetTag: appeal.target_tag,
		modId: appeal.mod_id,
		modTag: appeal.mod_tag,
		reason: appeal.reason,
		refId: appeal.ref_id,
		updatedAt: appeal.updated_at,
		createdAt: appeal.created_at,
	} as const;
}
