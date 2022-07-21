import type { CommandInteraction, InteractionResponse } from 'discord.js';
import type { Redis } from 'ioredis';

interface AntiRaidModalArgs {
	member_only?: boolean | undefined;
	reason?: string | undefined;
	days?: number | undefined;
}

export async function modal(
	interaction: CommandInteraction<'cached'>,
	data: AntiRaidModalArgs,
	logChannel: TextChannel,
	locale: string,
	redis: Redis,
): Promise<void> {
	const { memberOnly, reason, days } = {
		memberOnly: data.member_only ?? false,
		reason: data.reason ?? null,
		days: data.days ?? 1,
	};
}
