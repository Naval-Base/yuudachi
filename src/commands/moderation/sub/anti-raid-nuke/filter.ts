import { performance } from 'perf_hooks';
import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { ButtonStyle, CommandInteraction, ComponentType, Formatters, TextChannel } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { checkBan } from '../../../../functions/anti-raid/checkBan.js';
import {
	ageFilter,
	joinFilter,
	avatarFilter,
	confusablesFilter,
	patternFilter,
	zalgoFilter,
} from '../../../../functions/anti-raid/filters.js';
import {
	AntiRaidNukeModes,
	generateReportTargetInfo,
	reportSort,
	resolveDateLocale,
} from '../../../../functions/anti-raid/formatReport.js';
import { parseAvatar } from '../../../../functions/anti-raid/parseAvatar.js';
import { Case, CaseAction, createCase } from '../../../../functions/cases/createCase.js';
import { generateCasePayload } from '../../../../functions/logging/generateCasePayload.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { generateTargetInformation } from '../../../../util/generateTargetInformation.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { parseRegex } from '../../../../util/parseRegex.js';
import { resolveTimestamp } from '../../../../util/timestamp.js';
import type { AntiRaidResult } from '../../anti-raid-nuke.js';

enum Confusables {
	Off,
	OnlyPattern,
	OnlyMembers,
	PatternMembers,
}

export interface AntiRaidFilterArgs {
	pattern?: string | undefined;
	confusables?: number | undefined;
	insensitive?: boolean | undefined;
	zalgo?: boolean | undefined;
	full_match?: boolean | undefined;
	join_from?: string | undefined;
	join_to?: string | undefined;
	created_from?: string | undefined;
	created_to?: string | undefined;
	avatar?: string | undefined;
	reason?: string | undefined;
	days?: number | undefined;
	hide?: boolean | undefined;
}

export async function filter(
	interaction: CommandInteraction<'cached'>,
	data: AntiRaidFilterArgs,
	logChannel: TextChannel,
	ignoreRolesId: string[],
	locale: string,
	redis: Redis,
): Promise<void> {
	const start = performance.now();

	const reply = await interaction.deferReply({ ephemeral: data.hide ?? true });

	console.log(reply);

	const parsedJoinFrom = resolveTimestamp(data.join_from);
	if (data.join_from && !parsedJoinFrom) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'join_from' }));
	}

	const parsedJoinTo = resolveTimestamp(data.join_to);
	if (data.join_to && !parsedJoinTo) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'join_to' }));
	}

	const parsedCreatedFrom = resolveTimestamp(data.created_from);
	if (data.created_from && !parsedCreatedFrom) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'created_from' }));
	}

	const parsedCreatedTo = resolveTimestamp(data.created_to);
	if (data.created_to && !parsedCreatedTo) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'created_to' }));
	}

	const parsedPattern = parseRegex(data.pattern, data.insensitive ?? true, data.full_match ?? false);
	if (data.pattern && !parsedPattern) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.pattern_format', { locale }));
	}

	const parsedAvatar = await parseAvatar(interaction.client, data.avatar);
	if (data.avatar && !parsedAvatar) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.invalid_avatar', { locale }));
	}

	const parsedConfusables = {
		members: data.confusables === Confusables.OnlyMembers || data.confusables === Confusables.PatternMembers,
		pattern: data.confusables === Confusables.OnlyPattern || data.confusables === Confusables.PatternMembers,
	};

	const parsedData = {
		confusables: data.confusables ?? Confusables.PatternMembers,
		zalgo: data.zalgo ?? false,
		reason: data.reason ?? undefined,
		days: data.days ?? 1,
	};

	const fetchedMembers = await interaction.guild.members.fetch();
	const members = fetchedMembers.filter((member) => {
		if (joinFilter(member, parsedJoinFrom, parsedJoinTo)) return false;
		if (ageFilter(member, parsedCreatedFrom, parsedCreatedTo)) return false;
		if (avatarFilter(member, parsedAvatar)) return false;
		if (patternFilter(member, parsedPattern, parsedConfusables.pattern)) return false;
		if (parsedData.zalgo && zalgoFilter(member)) return false;
		if (parsedConfusables.members && confusablesFilter(member)) return false;
		return true;
	});

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.parameters.heading', {
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.parameters.current_time', {
			lng: locale,
			now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
		}),
		i18next.t('command.mod.anti_raid_nuke.parameters.join_after', {
			lng: locale,
			joinTo: resolveDateLocale(parsedJoinTo),
			joinFrom: resolveDateLocale(parsedJoinFrom),
		}),
		i18next.t('command.mod.anti_raid_nuke.parameters.created_after', {
			lng: locale,
			ageTo: resolveDateLocale(parsedCreatedTo),
			ageFrom: resolveDateLocale(parsedCreatedFrom),
		}),
	];

	if (parsedAvatar) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.parameters.avatar', {
				avatar: Formatters.inlineCode(parsedAvatar === 'none' ? 'No avatar' : parsedAvatar),
				lng: locale,
			}),
		);
	}

	if (parsedPattern) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.parameters.pattern', {
				lng: locale,
			}),
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			Formatters.codeBlock(parsedPattern.toString()),
		);
	}

	if (parsedData.days) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.parameters.days', {
				lng: locale,
				count: parsedData.days,
			}),
		);
	} else {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.parameters.days_none', {
				lng: locale,
			}),
		);
	}

	if (!members.size) {
		await interaction.editReply({
			content: `${i18next.t('command.mod.anti_raid_nuke.errors.no_hits', {
				lng: locale,
			})}\n\n${parameterStrings.join('\n')}`,
		});
		return;
	}

	const banKey = nanoid();
	const cancelKey = nanoid();
	const dryRunKey = nanoid();

	const banButton = createButton({
		customId: banKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		customId: dryRunKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.dry_run', { lng: locale }),
		style: ButtonStyle.Primary,
	});

	const potentialHits = Buffer.from(members.map((member) => generateTargetInformation(member)).join('\r\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	let creationLower = Number.POSITIVE_INFINITY;
	let creationUpper = Number.NEGATIVE_INFINITY;
	let joinLower = Number.POSITIVE_INFINITY;
	let joinUpper = Number.NEGATIVE_INFINITY;

	for (const member of members.values()) {
		if (member.joinedTimestamp) {
			joinLower = Math.min(member.joinedTimestamp, joinLower);
			joinUpper = Math.max(member.joinedTimestamp, joinUpper);
		}
		creationLower = Math.min(member.user.createdTimestamp, creationLower);
		creationUpper = Math.max(member.user.createdTimestamp, creationUpper);
	}

	const creationrange = ms(creationUpper - creationLower, true);
	const joinrange = ms(joinUpper - joinLower, true);

	await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
			members: members.size,
			creationrange,
			joinrange,
			lng: locale,
		})}\n\n${parameterStrings.join('\n')}`,
		files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
		components: [createMessageActionRow([cancelButton, banButton, dryRunButton])],
	});

	const collectedInteraction = await reply
		.awaitMessageComponent({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 60000,
		})
		.catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.anti_raid_nuke.cancel', {
				lng: locale,
			}),
			components: [],
			attachments: [],
		});
	} else if (collectedInteraction?.customId === banKey || collectedInteraction?.customId === dryRunKey) {
		const dryRunMode = collectedInteraction.customId === dryRunKey;

		const content = collectedInteraction.message.content + (dryRunMode ? (`\n\n${i18next.t('command.mod.anti_raid_nuke.parameters.dry_run', { lng: locale })}`) : '');

		await collectedInteraction.update({
			content, 
			components: [
				createMessageActionRow([
					{ ...cancelButton, disabled: true },
					{ ...banButton, disabled: true },
					{ ...dryRunButton, disabled: true },
				]),
			],
		});


		await redis.setex(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15, 'true');
		let idx = 0;
		const promises = [];

		const result: AntiRaidResult[] = [];

		for (const member of members.values()) {
			promises.push(
				(async () => {
					const reason = i18next.t('command.mod.anti_raid_nuke.reason', {
						current: ++idx,
						members: members.size,
						lng: locale,
					});

					const authorization = checkBan(member, interaction.user.id, ignoreRolesId);

					if (authorization) {
						result.push({
							member,
							success: false,
							error: i18next.t(`command.mod.anti_raid_nuke.errors.result.${authorization}`, { lng: locale }),
						});
						return;
					}

					const ban = dryRunMode ? true : await member.ban({ reason, deleteMessageDays: parsedData.days }).catch((err) => {
						const error = err as Error;
						
						result.push({
							member,
							success: false,
							error: i18next.t('command.mod.anti_raid_nuke.errors.result.ban_failed', { lng: locale, error: error.message }),
						});
						return false;
					});

					if (!ban) {
						return;
					}

					const case_ = await createCase(
						collectedInteraction.guild,
						generateCasePayload({
							guildId: collectedInteraction.guildId,
							user: collectedInteraction.user,
							args: {
								reason,
								user: {
									member: member,
									user: member.user,
								},
								days: parsedData.days,
								joinCutoff: dayjs(parsedJoinFrom).toDate(),
								accountCutoff: dayjs(parsedCreatedFrom).toDate(),
							},
							action: CaseAction.Ban,
							multi: true,
						}),
						true,
					).catch((err) => {
						const error = err as Error;
						
						result.push({
							member,
							success: false,
							error: i18next.t('command.mod.anti_raid_nuke.errors.result.case_failed', { lng: locale, error: error.message }),
						});
						return false;
					});

					if (!case_) {
						return;
					}

					await redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15);

					result.push({
						member,
						success: true,
						caseId: (case_ as Case).caseId,
						error: undefined,
					});

					return case_;
				})(),
			);
		}

		const resolvedCases = await Promise.all(promises);
		const cases = resolvedCases.filter(Boolean) as Case[];
		await redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 5);

		if (cases.length > 0) {
			console.log(cases);

			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				logChannel,
				cases,
				parsedData.reason ?? i18next.t('command.mod.anti_raid_nuke.success', { lng: locale, members: result.length }),
			);
		}

		const end = performance.now();

		const membersHit = Buffer.from(
			result
				.sort(reportSort)
				.map((r) => generateReportTargetInfo(r))
				.join('\n'),
		);
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		const message = await upsertAntiRaidNukeReport(
			collectedInteraction.guild.id,
			collectedInteraction.user,
			collectedInteraction.channel as TextChannel,
			result,
			{
				mode: AntiRaidNukeModes.Filter,
				time: end - start,
				avatar: parsedAvatar,
				cases,
				logChannel,
				dryRun: dryRunMode,
				...data,
			},
		);

		const attachment = message!.attachments.first();

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.success', {
				members: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.ansi`, attachment: membersHit }],
			components: [
				createMessageActionRow([
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						url: `${process.env.REPORT_FORMATER_URL!}${attachment!.url}`,
						label: i18next.t('command.mod.anti_raid_nuke.buttons.report', { lng: locale }),
					},
				]),
			],
		});
	}
}
