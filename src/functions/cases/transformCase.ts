import type { Snowflake } from 'discord.js';
import type { Case } from './createCase.js';

export interface RawCase {
	case_id: number;
	guild_id: Snowflake;
	action: number;
	role_id: Snowflake | null;
	action_expiration: string | null;
	reason: string | null;
	mod_id: Snowflake;
	mod_tag: string;
	target_id: Snowflake;
	target_tag: string;
	context_message_id: Snowflake | null;
	ref_id: number | null;
	log_message_id: Snowflake | null;
	action_processed: boolean;
	multi: boolean;
	created_at: string;
	join_cutoff: string | null;
	account_cutoff: string | null;
}

export function transformCase(case_: RawCase): Case {
	return {
		caseId: case_.case_id,
		guildId: case_.guild_id,
		action: case_.action,
		roleId: case_.role_id,
		actionExpiration: case_.action_expiration,
		reason: case_.reason,
		moderatorId: case_.mod_id,
		moderatorTag: case_.mod_tag,
		targetId: case_.target_id,
		targetTag: case_.target_tag,
		contextMessageId: case_.context_message_id,
		referenceId: case_.ref_id,
		logMessageId: case_.log_message_id,
		actionProcessed: case_.action_processed,
		multi: case_.multi,
		createdAt: case_.created_at,
		joinCutoff: case_.join_cutoff,
		accountCutoff: case_.account_cutoff,
	} as const;
}
