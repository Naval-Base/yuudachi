import { Buffer } from 'node:buffer';
import dayjs from 'dayjs';
import { ButtonStyle, codeBlock, ComponentType, inlineCode, time, TimestampStyles } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { InteractionParam, ArgsParam, LocaleParam } from '../../../../Command.js';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { blastOff } from '../../../../functions/anti-raid/blastOff.js';
import {
	ageFilter,
	joinFilter,
	avatarFilter,
	confusablesFilter,
	patternFilter,
	zalgoFilter,
} from '../../../../functions/anti-raid/filters.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import { parseAvatar } from '../../../../functions/anti-raid/parseAvatar.js';
import { resolveDateLocale } from '../../../../functions/anti-raid/resolveDateLocale.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { parseRegex } from '../../../../util/parseRegex.js';
import { resolveTimestamp } from '../../../../util/timestamp.js';

enum Confusables {
	Off,
	OnlyPattern,
	OnlyMembers,
	PatternAndMembers,
}

export async function filter(
	interaction: InteractionParam,
	args: ArgsParam<typeof AntiRaidNukeCommand>['filter'],
	locale: LocaleParam,
): Promise<void> {
	const reply = await interaction.deferReply({ ephemeral: args.hide ?? true });

	const parsedJoinFrom = resolveTimestamp(args.join_from);

	if (args.join_from && !parsedJoinFrom) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const parsedJoinTo = resolveTimestamp(args.join_to);

	if (args.join_to && !parsedJoinTo) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const parsedCreatedFrom = resolveTimestamp(args.created_from);

	if (args.created_from && !parsedCreatedFrom) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const parsedCreatedTo = resolveTimestamp(args.created_to);

	if (args.created_to && !parsedCreatedTo) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const parsedPattern = parseRegex(args.pattern, args.insensitive ?? true, args.full_match ?? false);

	if (args.pattern && !parsedPattern) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.filter.errors.pattern_format', { locale }));
	}

	const parsedAvatar = await parseAvatar(args.avatar);

	if (args.avatar && !parsedAvatar) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.filter.errors.invalid_avatar', { locale }));
	}

	const parsedConfusables = {
		members: args.confusables === Confusables.OnlyMembers || args.confusables === Confusables.PatternAndMembers,
		pattern: args.confusables === Confusables.OnlyPattern || args.confusables === Confusables.PatternAndMembers,
	};

	const fetchedMembers = await interaction.guild.members.fetch({ force: true });
	const members = fetchedMembers.filter(
		(member) =>
			joinFilter(member, parsedJoinFrom, parsedJoinTo) &&
			ageFilter(member, parsedCreatedFrom, parsedCreatedTo) &&
			avatarFilter(member, parsedAvatar) &&
			patternFilter(member, parsedPattern, parsedConfusables.pattern) &&
			(!args.zalgo || zalgoFilter(member)) &&
			(!parsedConfusables.members || confusablesFilter(member)),
	);

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.common.parameters.heading', {
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.current_time', {
			now: time(dayjs().unix(), TimestampStyles.ShortDateTime),
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.filter.parameters.join_after', {
			join_to: resolveDateLocale(parsedJoinTo),
			join_from: resolveDateLocale(parsedJoinFrom),
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.filter.parameters.created_after', {
			age_to: resolveDateLocale(parsedCreatedTo),
			age_from: resolveDateLocale(parsedCreatedFrom),
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.days', {
			count: Math.min(Math.max(Number(args.days ?? 1), 0), 7),
			lng: locale,
		}),
	];

	if (parsedAvatar) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.filter.parameters.avatar', {
				avatar: inlineCode(parsedAvatar === 'none' ? 'No avatar' : parsedAvatar),
				lng: locale,
			}),
		);
	}

	if (parsedPattern) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.filter.parameters.pattern', {
				lng: locale,
			}),
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			codeBlock(parsedPattern.toString()),
		);
	}

	if (!members.size) {
		await interaction.editReply({
			content: `${i18next.t('command.mod.anti_raid_nuke.filter.errors.no_hits', {
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
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		customId: dryRunKey,
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.dry_run', { lng: locale }),
		style: ButtonStyle.Primary,
	});

	const potentialHits = Buffer.from(members.map((member) => `${member.user.tag} (${member.id})`).join('\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	const { creationRange, joinRange } = formatMemberTimestamps(members);

	await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.common.pending', {
			count: members.size,
			creation_range: creationRange,
			join_range: joinRange,
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
					content: i18next.t('command.common.errors.timed_out', { lng: locale }),
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
			content: i18next.t('command.mod.anti_raid_nuke.common.cancel', {
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === banKey || collectedInteraction?.customId === dryRunKey) {
		const dryRunMode = collectedInteraction.customId === dryRunKey;

		const content =
			collectedInteraction.message.content +
			(dryRunMode ? `\n\n${i18next.t('command.mod.anti_raid_nuke.common.parameters.dry_run', { lng: locale })}` : '');

		await collectedInteraction.update({
			content,
			components: [
				createMessageActionRow([
					{ ...cancelButton, disabled: true },
					{ ...banButton, disabled: true },
				]),
			],
		});

		const { result, cases } = await blastOff(
			collectedInteraction,
			{
				days: Math.min(Math.max(Number(args.days ?? 1), 0), 7),
				joinCutoff: parsedJoinFrom,
				accountCutoff: parsedCreatedFrom,
				dryRun: dryRunMode,
			},
			members,
			locale,
		);

		if (!dryRunMode && cases.length) {
			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				cases,
				args.reason ??
					i18next.t('command.mod.anti_raid_nuke.common.success', {
						count: result.filter((r) => r.success).length,
						lng: locale,
					}),
			);
		}

		const membersHit = Buffer.from(
			result
				.map(
					(r) =>
						`${r.member.user.id.padEnd(19, ' ')} | Join: ${dayjs(r.member.joinedTimestamp).format(
							DATE_FORMAT_LOGFILE,
						)} | Creation: ${dayjs(r.member.user.createdTimestamp).format(DATE_FORMAT_LOGFILE)} | ${r.member.user.tag}`,
				)
				.join('\n'),
		);
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		await upsertAntiRaidNukeReport(collectedInteraction.guild, collectedInteraction.user, result);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.common.success', {
				count: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.txt`, attachment: membersHit }],
			components: [],
		});
	}
}
