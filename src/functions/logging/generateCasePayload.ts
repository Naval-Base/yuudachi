import type { GuildMember, Snowflake, User } from 'discord.js';
import type { CaseAction } from '../cases/createCase.js';

interface CasePayloadArgs {
	reason?: string | null;
	user: {
		user: User;
		member?: GuildMember | null;
	};
	days?: number;
	reference?: number | null;
	joinCutoff?: Date | null;
	accountCutoff?: Date | null;
}

export interface GenerateCasePayloadOptions {
	guildId: Snowflake;
	user?: User | null;
	roleId?: Snowflake | null;
	args: CasePayloadArgs;
	action: CaseAction;
	messageId?: Snowflake | null;
	duration?: number | null;
	multi?: boolean | null;
}

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
		actionExpiration: duration ? new Date(Date.now() + duration) : undefined,
		reason: args.reason,
		moderatorId: user?.id,
		moderatorTag: user?.tag,
		target: args.user.member,
		targetId: args.user.user.id,
		targetTag: args.user.user.tag,
		deleteMessageDays: args.days,
		contextMessageId: messageId,
		referenceId: args.reference ? Number(args.reference) : undefined,
		multi,
		joinCutoff: args.joinCutoff,
		accountCutoff: args.accountCutoff,
	} as const;
}
