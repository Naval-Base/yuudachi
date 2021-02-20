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
	roleId?: `${bigint}`;
	actionExpiration?: Date;
	reason?: string | null;
	moderatorId: `${bigint}`;
	targetId: string;
	deleteMessageDays?: number;
	contextMessageId?: `${bigint}`;
	referenceId?: number;
}

export interface UpdateCase {
	caseId: number | string;
	actionExpiration?: Date;
	reason?: string;
	contextMessageId?: `${bigint}`;
	referenceId?: number | string;
}

export interface Case {
	caseId: number;
	guildId: `${bigint}`;
	targetId: `${bigint}`;
	moderatorId: `${bigint}`;
	action: CaseAction;
	roleId?: `${bigint}`;
	actionExpiration?: Date;
	reason?: string;
	deleteMessageDays?: number;
	contextMessageId?: `${bigint}`;
	referenceId?: number;
}
