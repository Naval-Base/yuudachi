import type { GuildMember, Snowflake, User } from "discord.js";
import type { CaseAction } from "../cases/createCase.js";

type CasePayloadArgs = {
	caseReference?: number | null | undefined;
	days?: number | undefined;
	days?: number | undefined;
	reason?: string | null | undefined;
	reference?: number | null | undefined;
	reportReference?: number | null | undefined;
	user: {
		member?: GuildMember | null | undefined;
		user: User;
	};
};

type GenerateCasePayloadOptions = {
	action: CaseAction;
	args: CasePayloadArgs;
	duration?: number | null | undefined;
	guildId: Snowflake;
	messageId?: Snowflake | null | undefined;
	multi?: boolean | null | undefined;
	roleId?: Snowflake | null | undefined;
	user?: User | null | undefined;
};

export function generateCasePayload({
	guildId,
	user = null,
	roleId,
	args,
	action,
	messageId = null,
	duration,
	multi = false,
}: GenerateCasePayloadOptions) {
	return {
		guildId,
		action,
		roleId,
		actionExpiration: duration ? new Date(Date.now() + duration) : null,
		reason: args.reason,
		modId: user?.id,
		modTag: user?.tag,
		target: args.user.member,
		targetId: args.user.user.id,
		targetTag: args.user.user.tag,
		deleteMessageDays: args.days,
		contextMessageId: messageId,
		caseRefId: args.caseReference ? Number(args.caseReference) : undefined,
		reportRefId: args.reportReference ? Number(args.reportReference) : undefined,
		multi,
	} as const;
}
