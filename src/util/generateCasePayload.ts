import type { ButtonInteraction, CommandInteraction, GuildMember, SelectMenuInteraction, User } from 'discord.js';

import type { CaseAction } from './createCase';

interface CasePayloadArgs {
	reason?: string;
	user: {
		user: User;
		member?: GuildMember;
	};
	days?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
	reference?: number;
}

export function generateCasePayload(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	args: CasePayloadArgs,
	action: CaseAction,
	duration?: number,
) {
	return {
		guildId: interaction.guildId!,
		action,
		actionExpiration: duration ? new Date(Date.now() + duration) : undefined,
		reason: args.reason,
		moderatorId: interaction.user.id,
		moderatorTag: interaction.user.tag,
		target: args.user.member,
		targetId: args.user.user.id,
		targetTag: args.user.user.tag,
		deleteMessageDays: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 0,
		contextMessageId: interaction.isButton() ? interaction.message.id : null,
		referenceId: args.reference ? Number(args.reference) : undefined,
	} as const;
}
