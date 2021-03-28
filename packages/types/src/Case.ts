import type { Snowflake } from 'discord-api-types/v8';

export enum CaseAction {
	ROLE,
	UNROLE,
	WARN,
	KICK,
	SOFTBAN,
	BAN,
	UNBAN,
}

export interface CreateCase {
	action: CaseAction;
	roleId?: Snowflake;
	actionExpiration?: Date;
	reason?: string | null;
	moderatorId: Snowflake;
	targetId: string;
	deleteMessageDays?: number;
	contextMessageId?: Snowflake;
	referenceId?: number;
}

export interface UpdateCase {
	caseId: number | string;
	actionExpiration?: Date;
	reason?: string;
	contextMessageId?: Snowflake;
	referenceId?: number | string;
}

export interface Case {
	caseId: number;
	guildId: Snowflake;
	targetId: Snowflake;
	moderatorId: Snowflake;
	action: CaseAction;
	roleId?: Snowflake;
	actionExpiration?: Date;
	reason?: string;
	deleteMessageDays?: number;
	contextMessageId?: Snowflake;
	referenceId?: number;
}
