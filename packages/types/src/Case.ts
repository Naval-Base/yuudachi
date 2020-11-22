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
	reason: string;
	targetId: string;
	deleteMessageDays?: number;
	contextMessageId?: string;
	referenceId?: number;
}

export default interface Case {
	caseId: number;
	guildId: string;
	targetId: string;
	moderatorId: string;
	action: CaseAction;
	roleId?: string;
	actionExpiration?: Date;
	reason: string;
	deleteMessageDays?: number;
	contextMessageId?: string;
	referenceId?: number;
}
