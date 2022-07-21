import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import {
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	Formatters,
	GuildMember,
	TextChannel,
} from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import {
	ageFilter,
	joinFilter,
	avatarFilter,
	confusablesFilter,
	patternFilter,
	zalgoFilter,
} from '../../../../functions/anti-raid/filters.js';
import { parseAvatar } from '../../../../functions/anti-raid/parseAvatar.js';
import { Case, CaseAction, createCase } from '../../../../functions/cases/createCase.js';
import { generateCasePayload } from '../../../../functions/logging/generateCasePayload.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { generateTargetInformation } from '../../../../util/generateTargetInformation.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { parseRegex } from '../../../../util/parseRegex.js';
import { resolveTimestamp } from '../../../../util/timestamp.js';

enum Confusables {
	Off,
	OnlyPattern,
	OnlyMembers,
	PatternMembers,
}

interface AntiRaidManualArgs {
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

export async function manual(
	interaction: CommandInteraction<'cached'>,
	data: AntiRaidManualArgs,
	logChannel: TextChannel,
	locale: string,
	redis: Redis,
): Promise<void> {
	const reply = await interaction.deferReply({ ephemeral: data.hide ?? true })

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
		if (!joinFilter(member, parsedJoinFrom, parsedJoinTo)) return false;
		if (!ageFilter(member, parsedCreatedFrom, parsedCreatedTo)) return false;
		if (!avatarFilter(member, parsedAvatar)) return false;
		if (!patternFilter(member, parsedPattern, parsedConfusables.pattern)) return false;
		if (parsedData.zalgo && !zalgoFilter(member)) return false;
		if (parsedConfusables.members && !confusablesFilter(member)) return false;
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
			joinTo: Formatters.time(dayjs(parsedJoinTo).unix(), Formatters.TimestampStyles.ShortDateTime),
			joinFrom: Formatters.time(dayjs(parsedJoinFrom).unix(), Formatters.TimestampStyles.ShortDateTime),
		}),
		i18next.t('command.mod.anti_raid_nuke.parameters.created_after', {
			lng: locale,
			ageTo: Formatters.time(dayjs(parsedCreatedTo).unix(), Formatters.TimestampStyles.ShortDateTime),
			ageFrom: Formatters.time(dayjs(parsedCreatedFrom).unix(), Formatters.TimestampStyles.ShortDateTime),
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
		components: [createMessageActionRow([cancelButton, banButton])],
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
	} else if (collectedInteraction?.customId === banKey) {
		await collectedInteraction.update({
			components: [
				createMessageActionRow([
					{ ...cancelButton, disabled: true },
					{ ...banButton, disabled: true },
				]),
			],
		});

		await redis.setex(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15, 'true');
		let idx = 0;
		const promises = [];
		const fatalities: GuildMember[] = [];
		const survivors: GuildMember[] = [];
		for (const member of members.values()) {
			promises.push(
				createCase(
					collectedInteraction.guild,
					generateCasePayload({
						guildId: collectedInteraction.guildId,
						user: collectedInteraction.user,
						args: {
							reason: i18next.t('command.mod.anti_raid_nuke.reason', {
								current: ++idx,
								members: members.size,
								lng: locale,
							}),
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
				)
					.then((case_) => {
						fatalities.push(member);
						return case_;
					})
					.catch(() => {
						survivors.push(member);
					})
					.finally(() => void redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15)),
			);
		}

		const resolvedCases = await Promise.all(promises);
		const cases = resolvedCases.filter((resolvedCase) => resolvedCase) as Case[];
		await redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 5);

		await insertAntiRaidNukeCaseLog(
			collectedInteraction.guild,
			collectedInteraction.user,
			logChannel,
			cases,
			parsedData.reason ?? i18next.t('command.mod.anti_raid_nuke.success', { lng: locale, members: fatalities.length }),
		);

		const membersHit = Buffer.from(fatalities.map((member) => member.id).join('\r\n'));
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.success', {
				members: fatalities.length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-report.txt`, attachment: membersHit }],
			components: [],
		});
	}
}
