import dayjs from 'dayjs';
import { ButtonStyle, codeBlock, CommandInteraction, ComponentType, Formatters } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import executeNuke from '../../../../functions/anti-raid/executeNuke.js';
import {
	ageFilter,
	joinFilter,
	avatarFilter,
	confusablesFilter,
	patternFilter,
	zalgoFilter,
} from '../../../../functions/anti-raid/filters.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import { resolveDateLocale } from '../../../../functions/anti-raid/formatReport.js';
import { parseAvatar } from '../../../../functions/anti-raid/parseAvatar.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf.js';
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
	PatternMembers,
}

export async function filter(
	interaction: CommandInteraction<'cached'>,
	args: ArgumentsOf<typeof AntiRaidNukeCommand>['filter'],
	locale: string,
): Promise<void> {
	const reply = await interaction.deferReply({ ephemeral: args.hide ?? true });

	const parsedJoinFrom = resolveTimestamp(args.join_from);
	if (args.join_from && !parsedJoinFrom) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'join_from' }));
	}

	const parsedJoinTo = resolveTimestamp(args.join_to);
	if (args.join_to && !parsedJoinTo) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'join_to' }));
	}

	const parsedCreatedFrom = resolveTimestamp(args.created_from);
	if (args.created_from && !parsedCreatedFrom) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'created_from' }));
	}

	const parsedCreatedTo = resolveTimestamp(args.created_to);
	if (args.created_to && !parsedCreatedTo) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.duration_format', { locale, arg: 'created_to' }));
	}

	const parsedPattern = parseRegex(args.pattern, args.insensitive ?? true, args.full_match ?? false);
	if (args.pattern && !parsedPattern) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.pattern_format', { locale }));
	}

	const parsedAvatar = await parseAvatar(interaction.client, args.avatar);
	if (args.avatar && !parsedAvatar) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.invalid_avatar', { locale }));
	}

	const parsedConfusables = {
		members: args.confusables === Confusables.OnlyMembers || args.confusables === Confusables.PatternMembers,
		pattern: args.confusables === Confusables.OnlyPattern || args.confusables === Confusables.PatternMembers,
	};

	const fetchedMembers = await interaction.guild.members.fetch();
	const members = fetchedMembers.filter((member) => {
		if (joinFilter(member, parsedJoinFrom, parsedJoinTo)) {
			return false;
		}

		if (ageFilter(member, parsedCreatedFrom, parsedCreatedTo)) {
			return false;
		}

		if (avatarFilter(member, parsedAvatar)) {
			return false;
		}

		if (patternFilter(member, parsedPattern, parsedConfusables.pattern)) {
			return false;
		}

		if (args.zalgo && zalgoFilter(member)) {
			return false;
		}

		if (parsedConfusables.members && confusablesFilter(member)) {
			return false;
		}

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
			codeBlock(parsedPattern.toString()),
		);
	}

	if (args.days) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.parameters.days', {
				lng: locale,
				count: Math.min(Math.max(Number(args.days), 0), 7),
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

	const potentialHits = Buffer.from(members.map((member) => `${member.user.tag} (${member.id})`).join('\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	const { creationRange, joinRange } = formatMemberTimestamps(members);

	await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
			members: members.size,
			creationRange,
			joinRange,
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

		const content =
			collectedInteraction.message.content +
			(dryRunMode ? `\n\n${i18next.t('command.mod.anti_raid_nuke.parameters.dry_run', { lng: locale })}` : '');

		await collectedInteraction.update({
			content,
			components: [],
		});

		const { result, cases } = await executeNuke(
			collectedInteraction,
			{
				days: Math.min(Math.max(Number(args.days ?? 0), 0), 7),
				joinCutoff: parsedJoinFrom,
				accountCutoff: parsedCreatedFrom,
				dryRun: dryRunMode,
			},
			members,
			locale,
		);

		if (!dryRunMode && cases.length > 0) {
			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guildId,
				collectedInteraction.user,
				cases,
				args.reason ??
					i18next.t('command.mod.anti_raid_nuke.success', {
						lng: locale,
						members: result.filter((r) => r.success).length,
					}),
			);
		}

		const membersHit = Buffer.from(
			result
				.map(
					(r) =>
						`${r.member.user.id} | Join: ${dayjs(r.member.joinedTimestamp).format(
							DATE_FORMAT_LOGFILE,
						)} | Creation: ${dayjs(r.member.user.createdTimestamp).format(DATE_FORMAT_LOGFILE)} | ${r.member.user.tag}`,
				)
				.join('\n'),
		);
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		await upsertAntiRaidNukeReport(collectedInteraction.guildId, collectedInteraction.user, result);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.success', {
				members: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.txt`, attachment: membersHit }],
		});
	}
}
