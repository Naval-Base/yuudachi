import type { GuildMember, Snowflake, User } from 'discord.js';

import type { CaseAction } from '../cases/createCase';

interface CasePayloadArgs {
	reason?: string | null;
	user: {
		user: User;
		member?: GuildMember | null;
	};
	days?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
	reference?: number | null;
	joinCutoff?: Date | null;
	accountCutoff?: Date | null;
}

interface GenerateCasePayloadOptions {
	guildId: Snowflake;
	user: User;
	roleId?: Snowflake | null;
	args: CasePayloadArgs;
	action: CaseAction;
	messageId?: Snowflake | null;
	duration?: number | null;
	multi?: boolean | null;
}

export function generateCasePayload({
	guildId,
	user,
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
		moderatorId: user.id,
		moderatorTag: user.tag,
		target: args.user.member,
		targetId: args.user.user.id,
		targetTag: args.user.user.tag,
		deleteMessageDays: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 0,
		contextMessageId: messageId,
		referenceId: args.reference ? Number(args.reference) : undefined,
		multi,
		joinCutoff: args.joinCutoff,
		accountCutoff: args.accountCutoff,
	} as const;
}
