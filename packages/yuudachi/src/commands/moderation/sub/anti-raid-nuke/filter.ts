import dayjs from 'dayjs';
import { codeBlock, time, TimestampStyles } from 'discord.js';
import i18next from 'i18next';
import type { InteractionParam, ArgsParam, LocaleParam } from '../../../../Command.js';
import {
	ageFilter,
	joinFilter,
	avatarFilter,
	confusablesFilter,
	patternFilter,
	zalgoFilter,
} from '../../../../functions/anti-raid/filters.js';
import { parseAvatar } from '../../../../functions/anti-raid/parseAvatar.js';
import { resolveDateLocale } from '../../../../functions/anti-raid/resolveDateLocale.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';
import { parseRegex } from '../../../../util/parseRegex.js';
import { resolveTimestamp } from '../../../../util/timestamp.js';
import { AntiRaidNukeMode, handleAntiRaidNuke } from './coreCommand.js';
import { acquireLockIfPublic } from './utils.js';

export enum Confusables {
	Off,
	OnlyPattern,
	OnlyMembers,
	PatternAndMembers,
}

type ParseDateParams = {
	createdAfter?: string | undefined;
	createdBefore?: string | undefined;
	joinAfter?: string | undefined;
	joinBefore?: string | undefined;
};

function parseDates({ createdAfter, createdBefore, joinAfter, joinBefore }: ParseDateParams, locale: string) {
	const parsedCreatedAfter = resolveTimestamp(createdAfter);
	const parsedCreatedBefore = resolveTimestamp(createdBefore);
	const parsedJoinAfter = resolveTimestamp(joinAfter);
	const parsedJoinBefore = resolveTimestamp(joinBefore);

	if (
		(createdAfter && !parsedCreatedAfter) ||
		(createdBefore && !parsedCreatedBefore) ||
		(joinAfter && !parsedJoinAfter) ||
		(joinBefore && !parsedJoinBefore)
	) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	return {
		parsedCreatedAfter,
		parsedCreatedBefore,
		parsedJoinAfter,
		parsedJoinBefore,
	};
}

export async function filter(
	interaction: InteractionParam,
	args: ArgsParam<typeof AntiRaidNukeCommand>['filter'],
	locale: LocaleParam,
): Promise<void> {
	await acquireLockIfPublic(interaction.guildId, locale, args.hide);

	await interaction.deferReply({ ephemeral: args.hide ?? false });

	const { parsedCreatedAfter, parsedCreatedBefore, parsedJoinAfter, parsedJoinBefore } = parseDates(
		{
			createdAfter: args.created_after,
			createdBefore: args.created_before,
			joinAfter: args.join_after,
			joinBefore: args.join_before,
		},
		locale,
	);

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
			joinFilter(member, parsedJoinAfter, parsedJoinBefore) &&
			ageFilter(member, parsedCreatedAfter, parsedCreatedBefore) &&
			avatarFilter(member, parsedAvatar) &&
			patternFilter(member, parsedPattern, parsedConfusables.pattern) &&
			(!args.zalgo || zalgoFilter(member)) &&
			(!parsedConfusables.members || confusablesFilter(member)),
	);

	if (members.size === fetchedMembers.size) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.common.errors.no_filter', { locale }));
	}

	const parameterStrings = [];

	if (parsedCreatedAfter || parsedCreatedBefore || parsedJoinAfter || parsedJoinBefore) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.common.parameters.launch_time', {
				now: time(dayjs().unix(), TimestampStyles.ShortDateTime),
				lng: locale,
			}),
		);

		if (parsedCreatedAfter) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.filter.parameters.created.after', {
					date: resolveDateLocale(parsedCreatedAfter),
					lng: locale,
				}),
			);
		}

		if (parsedCreatedBefore) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.filter.parameters.created.before', {
					date: resolveDateLocale(parsedCreatedBefore),
					lng: locale,
				}),
			);
		}

		if (parsedJoinAfter) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.filter.parameters.join.after', {
					date: resolveDateLocale(parsedJoinAfter),
					lng: locale,
				}),
			);
		}

		if (parsedJoinBefore) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.filter.parameters.join.before', {
					date: resolveDateLocale(parsedJoinBefore),
					lng: locale,
				}),
			);
		}
	}

	if (parsedAvatar) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.filter.parameters.avatar', {
				avatar: parsedAvatar === 'none' ? 'No avatar' : parsedAvatar,
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

	if (args.zalgo) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.filter.parameters.zalgo', {
				lng: locale,
			}),
		);
	}

	if (parsedConfusables.members) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.filter.parameters.filter_confusables', {
				lng: locale,
			}),
		);
	}

	if (parsedConfusables.pattern) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.filter.parameters.clean_confusables', {
				lng: locale,
			}),
		);
	}

	await handleAntiRaidNuke(interaction, members, AntiRaidNukeMode.Filter, parameterStrings, args, locale);
}
