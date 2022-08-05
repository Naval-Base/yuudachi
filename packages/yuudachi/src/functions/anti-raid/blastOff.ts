import dayjs from 'dayjs';
import type { ButtonInteraction, Collection, GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { canBan } from './canBan.js';
import { kRedis } from '../../tokens.js';
import { type Case, CaseAction, createCase } from '../cases/createCase.js';
import { generateCasePayload } from '../logging/generateCasePayload.js';

export interface AntiRaidNukeResult {
	member: GuildMember;
	success: boolean;
	error?: string;
}

interface AntiRaidNukeArgs {
	days: number;
	dryRun: boolean;
	joinCutoff?: number | null;
	accountCutoff?: number | null;
}

export async function blastOff(
	interaction: ButtonInteraction<'cached'>,
	args: AntiRaidNukeArgs,
	members: Collection<string, GuildMember>,
	locale: string,
) {
	const redis = container.resolve<Redis>(kRedis);

	await redis.setex(`guild:${interaction.guildId}:anti_raid_nuke`, 15, 'true');
	let idx = 0;
	const promises = [];

	const result: AntiRaidNukeResult[] = [];

	for (const member of members.values()) {
		const authorization = await canBan(interaction.guildId, member, interaction.user.id);

		if (authorization) {
			result.push({
				member,
				success: false,
				error: i18next.t(`command.mod.anti_raid_nuke.common.errors.result.${authorization}`, { lng: locale }),
			});
			continue;
		}

		if (args.dryRun) {
			result.push({
				member,
				success: true,
			});
			continue;
		}

		promises.push(
			createCase(
				interaction.guild,
				generateCasePayload({
					guildId: interaction.guildId,
					user: interaction.user,
					args: {
						reason: i18next.t('command.mod.anti_raid_nuke.common.reason', {
							current: ++idx,
							count: members.size,
							lng: locale,
						}),
						user: {
							member: member,
							user: member.user,
						},
						days: args.days,
						joinCutoff: args.joinCutoff ? dayjs(args.joinCutoff).toDate() : undefined,
						accountCutoff: args.accountCutoff ? dayjs(args.accountCutoff).toDate() : undefined,
					},
					action: CaseAction.Ban,
					multi: true,
				}),
			)
				.then((case_) => {
					result.push({ member, success: true });
					return case_;
				})
				.catch((err) => result.push({ member, success: false, error: (err as Error).message }))
				.finally(() => void redis.expire(`guild:${interaction.guildId}:anti_raid_nuke`, 15)),
		);
	}

	const resolvedCases = await Promise.all(promises);
	const cases = resolvedCases.filter(Boolean) as Case[];
	await redis.expire(`guild:${interaction.guildId}:anti_raid_nuke`, 5);

	return {
		result,
		cases,
	} as const;
}
