import type { ButtonInteraction, Collection, GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { canBan } from './canBan.js';
import { kRedis } from '../../tokens.js';
import { type Case, CaseAction, createCase } from '../cases/createCase.js';
import { generateCasePayload } from '../logging/generateCasePayload.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export interface AntiRaidNukeResult {
	member: GuildMember;
	success: boolean;
	error?: string | undefined;
}

interface AntiRaidNukeArgs {
	days: number;
	dryRun: boolean;
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
	const ignoreRoles = await getGuildSetting<string[]>(interaction.guildId, SettingsKeys.AutomodIgnoreRoles);
	const targets = members.filter((member) => {
		const authorization = canBan(member, interaction.user.id, ignoreRoles);
		if (authorization) {
			result.push({
				member,
				success: false,
				error: i18next.t(`command.mod.anti_raid_nuke.common.errors.result.${authorization}`, { lng: locale }),
			});
			return false;
		}
		return true;
	});

	for (const member of targets.values()) {
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
							count: targets.size,
							lng: locale,
						}),
						user: {
							member: member,
							user: member.user,
						},
						days: args.days,
					},
					action: CaseAction.Ban,
					multi: true,
				}),
			)
				.then((case_) => {
					result.push({ member, success: true });
					return case_;
				})
				.catch((error: Error) => void result.push({ member, success: false, error: error.message }))
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
