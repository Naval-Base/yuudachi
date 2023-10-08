import type { Snowflake } from "discord.js";
import type { Case } from "./createCase.js";

export type RawCase = {
	action: number;
	action_expiration: string | null;
	action_processed: boolean;
	appeal_ref_id: number | null;
	case_id: number;
	context_message_id: Snowflake | null;
	created_at: string;
	guild_id: Snowflake;
	log_message_id: Snowflake | null;
	mod_id: Snowflake;
	mod_tag: string;
	multi: boolean;
	reason: string | null;
	ref_id: number | null;
	report_ref_id: number | null;
	role_id: Snowflake | null;
	target_id: Snowflake;
	target_tag: string;
};

export function transformCase(case_: RawCase): Case {
	return {
		caseId: case_.case_id,
		guildId: case_.guild_id,
		action: case_.action,
		roleId: case_.role_id,
		actionExpiration: case_.action_expiration,
		reason: case_.reason,
		modId: case_.mod_id,
		modTag: case_.mod_tag,
		targetId: case_.target_id,
		targetTag: case_.target_tag,
		contextMessageId: case_.context_message_id,
		refId: case_.ref_id,
		reportRefId: case_.report_ref_id,
		appealRefId: case_.appeal_ref_id,
		logMessageId: case_.log_message_id,
		actionProcessed: case_.action_processed,
		multi: case_.multi,
		createdAt: case_.created_at,
	} as const;
}
