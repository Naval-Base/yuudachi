import type { ButtonInteraction, GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import type { TargetRejection } from '../../commands/moderation/sub/anti-raid-nuke/utils.js';
import { kRedis } from '../../tokens.js';
import { type Case, CaseAction, createCase } from '../cases/createCase.js';
import { generateCasePayload } from '../logging/generateCasePayload.js';

export async function blastOff(
	interaction: ButtonInteraction<'cached'>,
	days: number,
	confirmations: GuildMember[],
	rejections: TargetRejection[],
	locale: string,
) {
	const redis = container.resolve<Redis>(kRedis);

	await redis.setex(`guild:${interaction.guildId}:anti_raid_nuke`, 15, 'true');
	let idx = 0;
	const promises = [];

	const confirmedHits: GuildMember[] = [];
	for (const member of confirmations) {
		promises.push(
			createCase(
				interaction.guild,
				generateCasePayload({
					guildId: interaction.guildId,
					user: interaction.user,
					args: {
						reason: i18next.t('command.mod.anti_raid_nuke.common.reason', {
							current: ++idx,
							count: confirmations.length,
							lng: locale,
						}),
						user: {
							member,
							user: member.user,
						},
						days,
					},
					action: CaseAction.Ban,
					multi: true,
				}),
			)
				// eslint-disable-next-line promise/prefer-await-to-then
				.then((case_) => {
					confirmedHits.push(member);
					return case_;
				})
				// eslint-disable-next-line promise/prefer-await-to-then
				.catch((error: Error) => void rejections.push({ member, reason: error.message }))
				// eslint-disable-next-line promise/prefer-await-to-then
				.finally(() => void redis.expire(`guild:${interaction.guildId}:anti_raid_nuke`, 15)),
		);
	}

	const resolvedCases = await Promise.all(promises);
	const cases = resolvedCases.filter(Boolean) as Case[];
	await redis.expire(`guild:${interaction.guildId}:anti_raid_nuke`, 5);

	return {
		confirmedHits,
		rejections,
		cases,
	} as const;
}
