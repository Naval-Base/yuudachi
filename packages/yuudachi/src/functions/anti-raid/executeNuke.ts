import dayjs from 'dayjs';
import type { ButtonInteraction, Collection, GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { checkBan } from './checkBan.js';
import type { AntiRaidResult } from '../../commands/moderation/anti-raid-nuke.js';
import { kRedis } from '../../tokens.js';
import { Case, CaseAction, createCase } from '../cases/createCase.js';
import { generateCasePayload } from '../logging/generateCasePayload.js';

interface executeNukeArgs {
	days: number;
	dryRun?: boolean;
	joinCutoff?: number;
	accountCutoff?: number;
}

export default async function executeNuke(
	interaction: ButtonInteraction<'cached'>,
	args: executeNukeArgs,
	members: Collection<string, GuildMember>,
	locale: string,
) {
	const redis = container.resolve<Redis>(kRedis);

	await redis.setex(`guild:${interaction.guildId}:anti_raid_nuke`, 15, 'true');
	let idx = 0;
	const promises = [];

	const result: AntiRaidResult[] = [];

	for (const member of members.values()) {
		const executor = (async () => {
			const authorization = await checkBan(interaction.guildId, member, interaction.user.id);

			if (authorization) {
				result.push({
					member,
					success: false,
					error: i18next.t(`command.mod.anti_raid_nuke.errors.result.${authorization}`, { lng: locale }),
				});
				return;
			}

			const reason = i18next.t('command.mod.anti_raid_nuke.reason', {
				current: ++idx,
				members: members.size,
				lng: locale,
			});

			if (args.dryRun) {
				result.push({
					member,
					success: true,
					caseId: undefined,
					error: undefined,
				});

				return;
			}

			let ban = false;

			try {
				await member.ban({ reason, deleteMessageDays: args.days }).catch((err) => {
					const error = err as Error;

					result.push({
						member,
						success: false,
						error: i18next.t('command.mod.anti_raid_nuke.errors.result.ban_failed', {
							lng: locale,
							error: error.message,
						}),
					});
					return false;
				});

				ban = true;

				const case_ = await createCase(
					interaction.guild,
					generateCasePayload({
						guildId: interaction.guildId,
						user: interaction.user,
						args: {
							reason,
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
					true,
				);

				await redis.expire(`guild:${interaction.guildId}:anti_raid_nuke`, 15);

				result.push({
					member,
					success: true,
					caseId: case_.caseId,
					error: undefined,
				});

				return case_;
			} catch (e) {
				const error = e as Error;

				result.push({
					member,
					success: false,
					caseId: undefined,
					error: i18next.t(`command.mod.anti_raid_nuke.errors.result.${ban ? 'case' : 'ban'}_failed`, {
						lng: locale,
						error: error.message,
					}),
				});

				return undefined;
			}
		})();

		promises.push(executor);
	}

	const resolvedCases = await Promise.all(promises);
	const cases = resolvedCases.filter(Boolean) as Case[];
	await redis.expire(`guild:${interaction.guildId}:anti_raid_nuke`, 5);

	return {
		result,
		cases,
	};
}
