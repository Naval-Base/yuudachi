import dayjs from 'dayjs';
import { CommandInteraction, ComponentType, Formatters, TextChannel } from 'discord.js';
import i18next from 'i18next';
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
import { resolveDateLocale } from '../../../../functions/anti-raid/formatReport.js';
import { parseAvatar } from '../../../../functions/anti-raid/parseAvatar.js';
import { createAntiRaidActionRow, formatMemberTimestamps } from '../../../../functions/anti-raid/utils.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import { logger } from '../../../../logger.js';
import { parseRegex } from '../../../../util/parseRegex.js';
import { resolveTimestamp } from '../../../../util/timestamp.js';

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
): Promise<void> {
	const reply = await interaction.deferReply({ ephemeral: data.hide ?? true });

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

	const { actionRow, banKey, cancelKey, dryRunKey } = createAntiRaidActionRow(locale);

	const potentialHits = Buffer.from(members.map((member) => `${member.user.tag} (${member.id})`).join('\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	const { creationrange, joinrange } = formatMemberTimestamps(members);

	await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
			members: members.size,
			creationrange,
			joinrange,
			lng: locale,
		})}\n\n${parameterStrings.join('\n')}`,
		files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
		components: [actionRow],
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
				days: parsedData.days,
				joinCutoff: parsedJoinFrom,
				accountCutoff: parsedCreatedFrom,
				dryRun: dryRunMode,
			},
			members,
			ignoreRolesId,
			locale,
		);

		if (!dryRunMode && cases.length > 0) {
			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				logChannel,
				cases,
				parsedData.reason ??
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

		await upsertAntiRaidNukeReport(
			collectedInteraction.guild.id,
			collectedInteraction.user,
			collectedInteraction.channel as TextChannel,
			result,
		);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.success', {
				members: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.txt`, attachment: membersHit }],
		});
	}
}
