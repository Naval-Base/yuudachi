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
	roleId?: string;
	actionExpiration?: Date;
	reason?: string | null;
	moderatorId: string;
	targetId: string;
	deleteMessageDays?: number;
	contextMessageId?: string;
	referenceId?: number;
}

export interface UpdateCase {
	caseId: number | string;
	actionExpiration?: Date;
	reason?: string;
	contextMessageId?: string;
	referenceId?: number | string;
}

export interface Case {
	caseId: number;
	guildId: string;
	targetId: string;
	moderatorId: string;
	action: CaseAction;
	roleId?: string;
	actionExpiration?: Date;
	reason?: string;
	deleteMessageDays?: number;
	contextMessageId?: string;
	referenceId?: number;
}
