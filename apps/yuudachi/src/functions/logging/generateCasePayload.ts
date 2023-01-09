import type { GuildMember, Snowflake, User } from "discord.js";
import type { CaseAction } from "../cases/createCase.js";

type CasePayloadArgs = {
	case_reference?: number | null | undefined;
	days?: number | undefined;
	reason?: string | null | undefined;
	report_reference?: number | null | undefined;
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
		refId: args.case_reference ? Number(args.case_reference) : undefined,
		reportRefId: args.report_reference ? Number(args.report_reference) : undefined,
		multi,
	} as const;
}
