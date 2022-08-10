import type { GuildMember, Snowflake, User } from 'discord.js';
import type { CaseAction } from '../cases/createCase.js';

interface CasePayloadArgs {
	reason?: string | undefined | null;
	user: {
		user: User;
		member?: GuildMember | undefined | null;
	};
	days?: number | undefined;
	reference?: number | undefined | null;
	joinCutoff?: Date | undefined | null;
	accountCutoff?: Date | undefined | null;
}

interface GenerateCasePayloadOptions {
	guildId: Snowflake;
	user?: User | undefined | null;
	roleId?: Snowflake | undefined | null;
	args: CasePayloadArgs;
	action: CaseAction;
	messageId?: Snowflake | undefined | null;
	duration?: number | undefined | null;
	multi?: boolean | undefined | null;
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
